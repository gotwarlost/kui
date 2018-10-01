package server

import (
	"encoding/json"
	"fmt"
	"io"
)

type projection interface {
	clear()
	projectData(w io.Writer) error
}

type dataFilter struct {
	p   projection
	dec *json.Decoder
	w   io.Writer
}

func newFilter(r io.Reader, w io.Writer, objType string) *dataFilter {
	dec := json.NewDecoder(r)
	p := projections[objType]
	if p == nil {
		p = projections[""]
	}
	return &dataFilter{
		dec: dec,
		w:   w,
		p:   p(),
	}
}

func (df *dataFilter) process() error {
	if err := df.skipToItems(); err != nil {
		return err
	}
	df.w.Write([]byte(`{ "items": `))
	if err := df.copyItems(); err != nil {
		return err
	}
	df.w.Write([]byte("\n}\n"))
	return nil
}

func (df *dataFilter) skipToItems() error {
	var itemsSeen bool
	for {
		tok, err := df.dec.Token()
		if err != nil {
			return err
		}
		if tok == nil {
			return fmt.Errorf("EOF before items key")
		}
		if tok == "items" {
			itemsSeen = true
		}
		if tok == json.Delim('[') && itemsSeen {
			return nil
		}
	}
}

func (df *dataFilter) copyItems() error {
	first := true
	df.w.Write([]byte("[\n"))

	for df.dec.More() {
		if first {
			first = false
		} else {
			df.w.Write([]byte(",\n"))
		}
		df.p.clear()
		if err := df.dec.Decode(df.p); err != nil {
			return err
		}
		if err := df.p.projectData(df.w); err != nil {
			return err
		}
	}
	df.w.Write([]byte("\n]"))
	return nil
}
