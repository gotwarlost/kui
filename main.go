package main

import (
	"net/http"
	"path/filepath"

	"github.com/gotwarlost/kui/pkg/server"
)

func main() {
	dir, err := filepath.Abs("dist/app")
	if err != nil {
		panic(err)
	}
	handler := server.New(nil, dir)
	http.ListenAndServe(":9000", handler)
}
