package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestProjection(t *testing.T) {
	b, err := ioutil.ReadFile("testdata/pod-list.json")
	require.Nil(t, err)

	var pod defaultObject
	var w bytes.Buffer
	df := newFilter(bytes.NewReader(b), &w, &pod)
	err = df.process()
	require.Nil(t, err)
	var generic interface{}
	err = json.Unmarshal(w.Bytes(), &generic)
	require.Nil(t, err)
	fmt.Println(w.String())
}
