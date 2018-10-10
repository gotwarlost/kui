package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"path/filepath"

	"github.com/gotwarlost/kui/pkg/server"
	"github.com/skratchdot/open-golang/open"
)

func main() {
	var port int
	flag.IntVar(&port, "port", 11491, "listen port, set to 0 for random port")
	flag.Parse()

	dir, err := filepath.Abs("dist/app")
	if err != nil {
		panic(err)
	}
	handler := server.New(nil, dir)
	l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		log.Fatalln(err)
	}
	addr := l.Addr()
	log.Println("listening on", addr)

	done := make(chan error, 2)
	go func() {
		done <- http.Serve(l, handler)
	}()

	u := "http://" + addr.String()
	if err := open.Run(u); err != nil {
		log.Println("error opening browser:", err, ", open", u, "manually")
	}
	err = <-done
	log.Fatalln(err)
}
