package registry

import (
	"fmt"
	"sort"
	"strings"

	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
)

// ResourceInfo is the summary information about a resource.
type ResourceInfo struct {
	Name              string              // resource name
	Kind              string              // the API kind
	Prefix            string              // the URL prefix to access it (/api or /apis)
	GroupVersion      schema.GroupVersion // the group and version of the resource
	IsClusterResource bool                // true if it is a cluster (non-namespaced) resource
	DisplayName       string              // the display name
	PluralName        string              // the plural display name
}

// ResourceRegistry is a collection of resources available for a given cluster.
type ResourceRegistry struct {
	types map[string]ResourceInfo
}

// New returns a resource registry for the specified cluster configuration.
func New(config *rest.Config) (*ResourceRegistry, error) {
	rr := &ResourceRegistry{types: map[string]ResourceInfo{}}
	client, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return nil, errors.Wrap(err, "discovery.NewDiscoveryClientForConfig")
	}
	resources, err := client.ServerPreferredResources()
	if err != nil {
		return nil, errors.Wrap(err, "client.ServerPreferredResources")
	}

	hasGetList := func(r v1.APIResource) bool {
		var g, l bool
		for _, s := range []string(r.Verbs) {
			if s == "get" {
				g = true
			}
			if s == "list" {
				l = true
			}
		}
		return g && l
	}

	isCore := func(gv schema.GroupVersion) bool {
		return gv.Group == "" || gv.Group == "apps"
	}

	for _, res := range resources {
		for _, r := range res.APIResources {
			if !hasGetList(r) {
				continue
			}
			prefix := "/apis"
			if res.GroupVersion == "v1" {
				prefix = "/api"
			}
			parts := strings.Split(res.GroupVersion, "/")
			var group, version string
			if len(parts) > 1 {
				group = parts[0]
				version = parts[1]
			} else {
				group = ""
				version = parts[0]
			}
			s, p := getSingularPluralNames(r.Name, r.Kind)
			info := ResourceInfo{
				Name:   r.Name,
				Kind:   r.Kind,
				Prefix: prefix,
				GroupVersion: schema.GroupVersion{
					Group:   group,
					Version: version,
				},
				IsClusterResource: !r.Namespaced,
				DisplayName:       s,
				PluralName:        p,
			}

			orig, ok := rr.types[info.Name]
			if ok && isCore(orig.GroupVersion) {
				continue
			}
			rr.types[info.Name] = info
		}
	}
	return rr, nil
}

// HasResource returns a true if the supplied name is a valid resource.
func (r *ResourceRegistry) HasResource(name string) bool {
	_, ok := r.types[name]
	return ok
}

// ResourceInfo returns the information for the supplied type or an error if it was not found.
func (r *ResourceRegistry) ResourceInfo(name string) (*ResourceInfo, error) {
	info, ok := r.types[name]
	if !ok {
		return nil, fmt.Errorf("invalid type %s", name)
	}
	return &info, nil
}

func (r *ResourceRegistry) AllResources() []ResourceInfo {
	return r.filteredResources(nil)
}

func (r *ResourceRegistry) NamespacedResources() []ResourceInfo {
	return r.filteredResources(func(r ResourceInfo) bool { return !r.IsClusterResource })
}

func (r *ResourceRegistry) ClusterResources() []ResourceInfo {
	return r.filteredResources(func(r ResourceInfo) bool { return r.IsClusterResource })
}

func (r *ResourceRegistry) filteredResources(filter func(r ResourceInfo) bool) []ResourceInfo {
	var ret []ResourceInfo
	for _, v := range r.types {
		if filter == nil || filter(v) {
			ret = append(ret, v)
		}
	}
	sort.Slice(ret, func(i, j int) bool {
		return ret[i].DisplayName < ret[j].DisplayName
	})
	return ret
}

func getSingularPluralNames(name, kind string) (string, string) {
	camel2Words := func(s string) string {
		var ret []string
		for i := 0; i < len(s); i++ {
			ch := s[i : i+1]
			next := " "
			if i < len(s)-1 {
				next = s[i+1 : i+2]
			}
			if strings.ToUpper(ch) == ch {
				if i > 0 && next != strings.ToUpper(next) {
					ret = append(ret, " ")
				}
			}
			ret = append(ret, ch)
		}
		return strings.Join(ret, "")
	}
	var plural []string
	done := false
	for i := 0; i < len(name); i++ {
		if i >= len(kind) {
			done = true
		}
		ch := name[i : i+1]
		if !done {
			if !(ch == kind[i:i+1] || ch == strings.ToLower(kind[i:i+1])) {
				done = true
			}
		}
		if !done {
			plural = append(plural, kind[i:i+1])
		} else {
			plural = append(plural, name[i:i+1])
		}
	}
	return camel2Words(kind), camel2Words(strings.Join(plural, ""))
}
