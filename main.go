package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"path/filepath"

	"github.com/gotwarlost/kui/pkg/server"
	"github.com/skratchdot/open-golang/open"
)

func main() {
	dir, err := filepath.Abs("dist/app")
	if err != nil {
		panic(err)
	}
	handler := server.New(nil, dir)
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		log.Fatalln(err)
	}
	addr := l.Addr().(*net.TCPAddr)
	hostPort := fmt.Sprintf("127.0.0.1:%d", addr.Port)
	log.Println("listening on", hostPort)

	done := make(chan error, 2)
	go func() {
		done <- http.Serve(l, handler)
	}()

	u := "http://" + hostPort
	if err := open.Run(u); err != nil {
		log.Println("error opening browser:", err, ", open", u, "manually")
	}
	err = <-done
	log.Fatalln(err)
}
