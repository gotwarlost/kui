package server

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/user"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/dimfeld/httptreemux"
	"github.com/gotwarlost/kui/pkg/kubeconfig"
	"github.com/gotwarlost/kui/pkg/registry"
	"github.com/mash/go-accesslog"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/rest"
)

const (
	contextParamName    = "context"
	resourceIDParamName = "id"
	resourceQueryParam  = "res"
	namespaceQueryParam = "namespace"
)

// Impersonation provides a mechanism to impersonate other users and
// groups when making calls to the Kubernetes API. This is applied for _all_
// contexts and may only be meaningfully used when the user is a cluster
// admin for all contexts.
type Impersonation struct {
	User   string   // user to impersonate
	Groups []string // groups to impersonate
}

// Config is the server config.
type Config struct {
	StaticRoot      string        // the root of the filesystem for the static server
	KubeConfigFiles []string      // list of kubeconfig files, empty uses k8s defaults
	Impersonation   Impersonation // any client impersonation required
	UserAgent       string        // the user-agent to use
}

// APIHandler is an HTTP handler with some additional methods.
type APIHandler interface {
	http.Handler
	BustCache() // bust all internal caches
}

// conn is connection information for a specific context that includes
// the base URL and a configured client.
type conn struct {
	baseURL string
	client  *http.Client
}

// fileWithStats tracks a file and its associated stat object, if found.
type fileWithStats struct {
	file string
	stat os.FileInfo
}

// hdrTransport provides a round tripper that adds user-agent and impersonation
// headers.
type hdrTransport struct {
	ua            string
	impersonation Impersonation
	delegate      http.RoundTripper
}

// RoundTrip implements the round tripper.
func (it *hdrTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	if it.ua != "" {
		r.Header.Set("User-Agent", it.ua)
	}
	imp := it.impersonation
	if imp.User != "" {
		r.Header.Set("Impersonate-User", imp.User)
	}
	for _, g := range imp.Groups {
		if g != "" {
			r.Header.Add("Impersonate-Group", g)
		}
	}
	return it.delegate.RoundTrip(r)
}

// server implements APIHandler
type server struct {
	ua            string
	impersonation Impersonation
	kcFiles       []fileWithStats
	l             sync.RWMutex
	cfg           *kubeconfig.Config
	regMap        map[string]*registry.ResourceRegistry
	connMap       map[string]*conn
}

type handler struct {
	http.Handler
	*server
}

var lg = log.New(os.Stderr, "[accesslog] ", 0)

type logger struct {
}

func (l *logger) Log(rec accesslog.LogRecord) {
	if rec.Status < 200 && rec.Status >= 400 {
		lg.Printf("(%d, %15v) %s %s", rec.Status, rec.ElapsedTime, rec.Method, rec.Uri)
	}
}

// getDefaultKubeConfigFiles returns the default kubeconfig files typically derived
// by Kubernetes (from KUBECONFIG and ~/.kube/config).
func getDefaultKubeConfigFiles() []string {
	kc := os.Getenv("KUBECONFIG")
	if kc != "" {
		return strings.Split(kc, strconv.QuoteRune(filepath.ListSeparator))
	}
	var homeDir string
	u, err := user.Current()
	if err != nil {
		log.Printf("error getting current user, using $HOME, %v\n", err)
		homeDir = os.Getenv("HOME")
	} else {
		homeDir = u.HomeDir
	}
	if homeDir != "" {
		return []string{filepath.Join(homeDir, ".kube", "config")}
	}
	return nil
}

func New(c Config) (APIHandler, error) {
	files := c.KubeConfigFiles
	staticRoot := c.StaticRoot

	if len(files) == 0 {
		files = getDefaultKubeConfigFiles()
	}
	var fs []fileWithStats
	for _, f := range files {
		fws := fileWithStats{file: f}
		s, err := os.Stat(f)
		if err != nil {
			log.Println("[warn] stat error on kubeconfig file", f)
		} else {
			fws.stat = s
		}
		fs = append(fs, fws)
	}
	s := &server{
		ua:            c.UserAgent,
		impersonation: c.Impersonation,
		kcFiles:       fs,
		regMap:        map[string]*registry.ResourceRegistry{},
		connMap:       map[string]*conn{},
	}
	b, err := ioutil.ReadFile(filepath.Join(staticRoot, "index.html"))
	if err != nil {
		return nil, fmt.Errorf("unable to read index.html under %s", staticRoot)
	}

	mux := httptreemux.NewContextMux()
	mux.GET("/api/contexts", s.listContexts)
	mux.GET(fmt.Sprintf("/api/contexts/:%s", contextParamName), s.getContext)
	mux.GET(fmt.Sprintf("/api/contexts/:%s/resources", contextParamName), s.listResources)
	mux.GET(fmt.Sprintf("/api/contexts/:%s/resources/:%s", contextParamName, resourceIDParamName), s.getResource)
	mux.GET("/ui/*", func(w http.ResponseWriter, r *http.Request) {
		w.Write(b)
	})
	mux.NotFoundHandler = http.FileServer(http.Dir(staticRoot)).ServeHTTP

	h := accesslog.NewLoggingHandler(mux, &logger{})
	return &handler{Handler: h, server: s}, nil
}

// BustCache busts all caches including the connection and the registry cache.
func (s *server) BustCache() {
	s.l.Lock()
	defer s.l.Unlock()
	s.cfg = nil
	s.regMap = map[string]*registry.ResourceRegistry{}
	s.connMap = map[string]*conn{}
}

func (s *server) getCachedConfig() *kubeconfig.Config {
	s.l.RLock()
	defer s.l.RUnlock()
	return s.cfg
}

func (s *server) setCachedConfig(c *kubeconfig.Config) {
	s.l.Lock()
	defer s.l.Unlock()
	s.cfg = c
	s.connMap = map[string]*conn{}
}

func (s *server) getCachedRegistry(ctx string) *registry.ResourceRegistry {
	s.l.RLock()
	defer s.l.RUnlock()
	return s.regMap[ctx]
}

func (s *server) setCachedRegistry(ctx string, r *registry.ResourceRegistry) {
	s.l.Lock()
	defer s.l.Unlock()
	s.regMap[ctx] = r
}

func (s *server) getCachedConn(ctx string) *conn {
	s.l.RLock()
	defer s.l.RUnlock()
	return s.connMap[ctx]
}

func (s *server) setCachedConn(ctx string, c *conn) {
	s.l.Lock()
	defer s.l.Unlock()
	s.connMap[ctx] = c
}

// getConfig returns the k8s config.
func (s *server) getConfig() (*kubeconfig.Config, error) {
	for _, fws := range s.kcFiles {
		st, err := os.Stat(fws.file)
		if err != nil {
			continue
		}
		if fws.stat != nil {
			if fws.stat.ModTime().Before(st.ModTime()) {
				s.setCachedConfig(nil)
			}
		}
	}
	cc := s.getCachedConfig()
	if cc != nil {
		return cc, nil
	}
	var files []string
	for _, fws := range s.kcFiles {
		files = append(files, fws.file)
	}
	cfg, err := kubeconfig.New(files)
	if err != nil {
		s.setCachedConfig(cfg)
	}
	return cfg, err
}

func (s *server) getRegistry(cfg *kubeconfig.Config, ctx string) (*registry.ResourceRegistry, error) {
	rr := s.getCachedRegistry(ctx)
	if rr != nil {
		return rr, nil
	}
	rc, err := cfg.RESTConfig(ctx)
	if err != nil {
		return nil, err
	}
	return registry.New(rc)
}

func defaultServerUrlFor(config *rest.Config) (*url.URL, string, error) {
	// config.Insecure is taken to mean "I want HTTPS but don't bother checking the certs against a CA."
	hasCA := len(config.CAFile) != 0 || len(config.CAData) != 0
	hasCert := len(config.CertFile) != 0 || len(config.CertData) != 0
	defaultTLS := hasCA || hasCert || config.Insecure
	host := config.Host
	if host == "" {
		host = "localhost"
	}
	return rest.DefaultServerURL(host, config.APIPath, schema.GroupVersion{}, defaultTLS)
}

func (s *server) getConn(cfg *kubeconfig.Config, ctx string) (*conn, error) {
	c := s.getCachedConn(ctx)
	if c != nil {
		return c, nil
	}
	rc, err := cfg.RESTConfig(ctx)
	if err != nil {
		return nil, err
	}

	rt, err := rest.TransportFor(rc)
	if err != nil {
		return nil, err
	}

	rt = &hdrTransport{
		ua:            s.ua,
		impersonation: s.impersonation,
		delegate:      rt,
	}

	u, _, err := defaultServerUrlFor(rc)
	if err != nil {
		return nil, err
	}
	c = &conn{client: &http.Client{Transport: rt}, baseURL: u.String()}
	s.setCachedConn(ctx, c)
	return c, nil
}

func (s *server) listContexts(w http.ResponseWriter, r *http.Request) {
	var ret ContextList
	cfg, err := s.getConfig()
	if err != nil {
		ret.Errors = append(ret.Errors, err.Error())
	} else {
		ret.Items = cfg.ContextNames()
		ret.DefaultContext = cfg.CurrentContext()
	}
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.Encode(ret)
}

func (s *server) getContext(w http.ResponseWriter, r *http.Request) {
	p := httptreemux.ContextParams(r.Context())
	cfg, err := s.getConfig()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	ctx := p[contextParamName]
	if !cfg.IsValidContext(ctx) {
		http.Error(w, "invalid context:"+ctx, 400)
		return
	}
	rr, err := s.getRegistry(cfg, ctx)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	var ret ContextDetail
	ret.DefaultNamespace = cfg.DefaultNamespaceForContext(ctx)
	for _, res := range rr.AllResources() {
		ret.Resources = append(ret.Resources, fromResource(res))
	}
	ret.Aliases = map[string]string{}
	for k, v := range rr.Aliases() {
		ret.Aliases[k.String()] = v.String()
	}
	ret.PreferredVersions = map[string]string{}
	for k, v := range rr.PreferredVersions() {
		ret.PreferredVersions[k.String()] = v.String()
	}

	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.Encode(ret)
}

func (s *server) getResourceInfo(cfg *kubeconfig.Config, ctx string, id string) (*registry.ResourceInfo, error) {
	rr, err := s.getRegistry(cfg, ctx)
	if err != nil {
		return nil, err
	}
	key, err := registry.ResourceKeyFromString(id)
	if err != nil {
		return nil, err
	}
	return rr.ResourceInfo(key)
}

var downLog = log.New(os.Stderr, "[downstream] ", 0)

func (s *server) getOrList(w http.ResponseWriter, r *http.Request, object bool) {
	p := httptreemux.ContextParams(r.Context())
	cfg, err := s.getConfig()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	r.ParseForm()

	ctx := p[contextParamName]
	res := r.Form.Get(resourceQueryParam)
	id := p[resourceIDParamName]

	ri, err := s.getResourceInfo(cfg, ctx, res)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	conn, err := s.getConn(cfg, ctx)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	path := ri.APIListPath(r.Form.Get(namespaceQueryParam))

	if object {
		path += "/" + id
	}

	u := conn.baseURL + path
	var queryParams []string
	prefix := "k8s."
	for k := range r.Form {
		if strings.Index(k, prefix) == 0 {
			k2 := k[len(prefix):]
			v := url.QueryEscape(r.Form.Get(k))
			queryParams = append(queryParams, fmt.Sprintf("%s=%s", k2, v))
		}
	}
	if len(queryParams) > 0 {
		u = fmt.Sprintf("%s?%s", u, strings.Join(queryParams, "&"))
	}

	start := time.Now()
	downLog.Println("GET", u)
	resp, err := conn.client.Get(u)
	if err != nil {
		downLog.Println("error: GET", u, err)
		http.Error(w, err.Error(), 500)
		return
	}
	defer func() {
		d := time.Now().Sub(start)
		code := resp.StatusCode
		if code < 200 || code >= 400 {
			downLog.Printf("(%d, %15v) %s %s", code, d, "GET", u)
		}
	}()

	defer resp.Body.Close()
	w.WriteHeader(resp.StatusCode)

	if object {
		io.Copy(w, resp.Body)
		return
	}

	filter := newFilter(resp.Body, w, ri.Key.WithEmptyVersion().String())
	if err := filter.process(); err != nil {
		log.Println(err)
	}
}

func (s *server) listResources(w http.ResponseWriter, r *http.Request) {
	s.getOrList(w, r, false)
}

func (s *server) getResource(w http.ResponseWriter, r *http.Request) {
	s.getOrList(w, r, true)
}
