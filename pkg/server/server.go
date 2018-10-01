package server

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"path/filepath"
	"sync"

	"github.com/dimfeld/httptreemux"
	"github.com/gotwarlost/kui/pkg/kubeconfig"
	"github.com/gotwarlost/kui/pkg/registry"
	"github.com/mash/go-accesslog"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/rest"
)

const (
	contextParamName    = "context"
	resourceParamName   = "resource"
	resourceIDParamName = "id"
	namespaceQueryParam = "namespace"
)

type APIHandler interface {
	http.Handler
	BustCache()
}

type conn struct {
	baseURL string
	client  *http.Client
}

type server struct {
	l       sync.RWMutex
	kcFiles []string
	cfg     *kubeconfig.Config
	regMap  map[string]*registry.ResourceRegistry
	connMap map[string]*conn
}

type handler struct {
	http.Handler
	*server
}

type logger struct {
}

func (l *logger) Log(rec accesslog.LogRecord) {
	log.Printf("(%d) %s %s", rec.Status, rec.Method, rec.Uri)
}

func New(files []string, staticRoot string) APIHandler {
	s := &server{
		kcFiles: files,
		regMap:  map[string]*registry.ResourceRegistry{},
		connMap: map[string]*conn{},
	}
	b, err := ioutil.ReadFile(filepath.Join(staticRoot, "index.html"))
	if err != nil {
		panic("unable to read index.html under " + staticRoot)
	}
	mux := httptreemux.NewContextMux()
	mux.GET("/api/contexts", s.listContexts)
	mux.GET(fmt.Sprintf("/api/contexts/:%s", contextParamName), s.getContext)
	mux.GET(fmt.Sprintf("/api/contexts/:%s/resources/:%s", contextParamName, resourceParamName), s.listResources)
	mux.GET(fmt.Sprintf("/api/contexts/:%s/resources/:%s/:%s", contextParamName, resourceParamName, resourceIDParamName), s.getResource)
	mux.GET("/ui/*", func(w http.ResponseWriter, r *http.Request) {
		w.Write(b)
	})
	mux.NotFoundHandler = http.FileServer(http.Dir(staticRoot)).ServeHTTP

	h := accesslog.NewLoggingHandler(mux, &logger{})
	return &handler{Handler: h, server: s}
}

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

func (s *server) getConfig() (*kubeconfig.Config, error) {
	cc := s.getCachedConfig()
	if cc != nil {
		return cc, nil
	}
	cfg, err := kubeconfig.New(s.kcFiles)
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
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	enc.Encode(ret)
}

func (s *server) getResourceInfo(cfg *kubeconfig.Config, ctx string, name string) (*registry.ResourceInfo, error) {
	rr, err := s.getRegistry(cfg, ctx)
	if err != nil {
		return nil, err
	}
	return rr.ResourceInfo(name)
}

func (s *server) getOrList(w http.ResponseWriter, r *http.Request, object bool) {
	p := httptreemux.ContextParams(r.Context())
	cfg, err := s.getConfig()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	ctx := p[contextParamName]
	res := p[resourceParamName]
	id := p[resourceIDParamName]

	ri, err := s.getResourceInfo(cfg, ctx, res)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	conn, err := s.getConn(cfg, ctx)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	r.ParseForm()
	ns := r.Form.Get(namespaceQueryParam)
	if ri.IsClusterResource {
		ns = ""
	}

	gpath := "/" + ri.GroupVersion.Version
	if ri.GroupVersion.Group != "" {
		gpath = "/" + ri.GroupVersion.Group + gpath
	}

	endPath := "/" + ri.Name
	if ns != "" {
		endPath = "/namespaces/" + ns + endPath
	}

	if object {
		endPath += "/" + id
	}

	u := conn.baseURL + ri.Prefix + gpath + endPath
	log.Println("GET", u)
	resp, err := conn.client.Get(u)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer resp.Body.Close()
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func (s *server) listResources(w http.ResponseWriter, r *http.Request) {
	s.getOrList(w, r, false)
}

func (s *server) getResource(w http.ResponseWriter, r *http.Request) {
	s.getOrList(w, r, true)
}
