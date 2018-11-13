package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/getlantern/systray"
	"github.com/gotwarlost/kui/pkg/server"
	"github.com/skratchdot/open-golang/open"
)

var (
	appDir            string
	port              int
	foreground        bool
	icon              []byte
	serverURL         string
	doneChan          <-chan error
	impersonateUser   string
	impersonateGroups string
)

// Version is the program version.
var Version string

func defaultAppDir() string {
	ultimateDefault := func() string {
		rel := filepath.Join(".", "dist")
		dir, err := filepath.Abs(rel)
		if err != nil {
			return rel
		}
		return dir
	}
	appDir = os.Getenv("KUI_APP_DIR")
	if appDir != "" {
		return appDir
	}
	exe, err := os.Executable()
	if err != nil {
		return ultimateDefault()
	}
	exePath, err := filepath.EvalSymlinks(exe)
	if err != nil {
		exePath = exe
	}
	dir := filepath.Join(filepath.Dir(exePath), "dist")
	_, err = os.Stat(filepath.Join(dir, "index.html"))
	if err != nil {
		return ultimateDefault()
	}
	return dir
}

func initialize() {
	appDir = defaultAppDir()

	fs := flag.NewFlagSet("kui", flag.ExitOnError)
	fs.StringVar(&appDir, "app-dir", appDir, "path to webapp directory (from $KUI_APP_DIR, if set)")
	fs.StringVar(&impersonateUser, "as", "", "user to impersonate")
	fs.StringVar(&impersonateGroups, "as-group", "", "comma-separated groups to impersonate")
	fs.IntVar(&port, "port", 11491, "listen port, set to 0 for random port")
	fs.BoolVar(&foreground, "fore", false, "run server in foreground, no system tray")
	fs.Parse(os.Args[1:])

	dir, err := filepath.Abs(appDir)
	if err != nil {
		log.Fatalln("unable to get absolute path for", appDir, err)
	}
	_, err = os.Stat(filepath.Join(appDir, "index.html"))
	if err != nil {
		log.Fatalln("unable to find index.html,", err)
	}
	appDir = dir

	if foreground {
		return
	}

	var iconFile string
	switch runtime.GOOS {
	case "windows":
		iconFile = "k8s.ico"
	case "darwin":
		iconFile = "k8s.png"
	default:
		iconFile = "k8s.icns"
	}

	icon, err = ioutil.ReadFile(filepath.Join(appDir, "icons", iconFile))
	if err != nil {
		log.Fatalln(err)
	}
}

func startServer() (string, <-chan error) {
	ch := make(chan error, 2)
	l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		ch <- err
		return "", ch
	}
	addr := l.Addr()
	log.Println("listening on", addr)
	imp := server.Impersonation{
		User: impersonateUser,
	}
	if impersonateGroups != "" {
		imp.Groups = strings.Split(impersonateGroups, ",")
	}
	cfg := server.Config{
		StaticRoot:    appDir,
		Impersonation: imp,
		UserAgent:     "kui/1.0 (" + runtime.GOOS + "/" + runtime.GOARCH + ")", // FIXME for real version
	}
	handler, err := server.New(cfg)
	if err != nil {
		ch <- err
		return "", ch
	}
	go func() {
		ch <- http.Serve(l, handler)
	}()
	return fmt.Sprintf("http://%s", addr.String()), ch
}

func openBrowser() {
	u := serverURL
	if err := open.Run(u); err != nil {
		log.Println("error opening browser:", err, ", open", u, "manually")
	}
}

func onReady() {
	u, done := startServer()
	select {
	case err := <-done:
		log.Fatalln(err)
	default:
		break
	}
	serverURL = u
	doneChan = done

	if !foreground {
		systray.SetTooltip("Kubernetes UI")
		systray.SetIcon(icon)
		ob := systray.AddMenuItem("New browser window", fmt.Sprintf("opens a browser to %s where the KUI server is listening", serverURL))
		systray.AddSeparator()
		eb := systray.AddMenuItem("Quit", "quit kui")
		go func() {
			for range ob.ClickedCh {
				openBrowser()
			}
		}()
		go func() {
			<-eb.ClickedCh
			systray.Quit()
		}()
	}
	openBrowser()
}

func main() {
	runtime.LockOSThread()
	initialize()
	if foreground {
		onReady()
		err := <-doneChan
		log.Fatalln(err)
	}
	systray.Run(onReady, func() {})
}
