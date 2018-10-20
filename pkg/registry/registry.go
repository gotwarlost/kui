package registry

import (
	"fmt"
	"sort"
	"strings"

	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
)

type ResourceVersion string

func (rv ResourceVersion) Group() string {
	parts := strings.SplitN(string(rv), "/", 2)
	if len(parts) == 1 {
		return ""
	}
	return parts[0]
}
func (rv ResourceVersion) Version() string {
	parts := strings.SplitN(string(rv), "/", 2)
	if len(parts) == 1 {
		return parts[0]
	}
	return parts[1]
}

func (rv ResourceVersion) EmptyVersion() ResourceVersion {
	return ResourceVersion(fmt.Sprintf("%s/%s", rv.Group(), ""))
}

func (rv ResourceVersion) String() string {
	return string(rv)
}

type ResourceKey struct {
	ResourceVersion ResourceVersion
	Kind            string
}

func (r ResourceKey) EmptyVersion() ResourceKey {
	return ResourceKey{ResourceVersion: r.ResourceVersion.EmptyVersion(), Kind: r.Kind}
}

func (r ResourceKey) String() string {
	return fmt.Sprintf("%s:%s", r.ResourceVersion, r.Kind)
}

func ResourceKeyFromString(s string) (ResourceKey, error) {
	parts := strings.SplitN(s, ":", 2)
	if len(parts) < 2 {
		return ResourceKey{}, fmt.Errorf("invalid resource key %q", s)
	}
	return ResourceKey{ResourceVersion: ResourceVersion(parts[0]), Kind: parts[1]}, nil
}

// ResourceInfo is the summary information about a resource.
type ResourceInfo struct {
	Key               ResourceKey // group version + kind
	IsClusterResource bool        // true if it is a cluster (non-namespaced) resource
	DisplayName       string      // the display name
	PluralName        string      // the plural display name
	APIPathName       string      // "daemonsets", "pods" etc.
}

func (r ResourceInfo) APIListPath(namespace string) string {
	prefix := "/apis"
	if r.Key.ResourceVersion.Group() == "" {
		prefix = "/api"
	}
	if r.IsClusterResource {
		namespace = ""
	}
	endPath := "/" + r.APIPathName
	if namespace != "" {
		endPath = "/namespaces/" + namespace + endPath
	}
	return prefix + "/" + r.Key.ResourceVersion.String() + endPath
}

// ResourceRegistry is a collection of preferred resources available for a given cluster.
type ResourceRegistry struct {
	types             map[ResourceKey]ResourceInfo
	aliases           map[ResourceKey]ResourceKey
	preferredVersions map[ResourceKey]ResourceKey
}

// New returns a resource registry for the specified cluster configuration.
func New(config *rest.Config) (*ResourceRegistry, error) {
	rr := &ResourceRegistry{
		types:             map[ResourceKey]ResourceInfo{},
		aliases:           map[ResourceKey]ResourceKey{},
		preferredVersions: map[ResourceKey]ResourceKey{},
	}
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

	for _, res := range resources {
		for _, r := range res.APIResources {
			if !hasGetList(r) {
				continue
			}

			rv := ResourceVersion(res.GroupVersion)
			if r.Kind == "Event" && rv.Group() == "events.k8s.io" { // XXX: which one is later v1/Event or this one?
				continue
			}
			key := ResourceKey{ResourceVersion: rv, Kind: r.Kind}
			s, p := getSingularPluralNames(r.Name, r.Kind)

			info := ResourceInfo{
				Key:               key,
				IsClusterResource: !r.Namespaced,
				DisplayName:       s,
				PluralName:        p,
				APIPathName:       r.Name,
			}

			rr.types[key] = info
		}
	}

	var preferredKeys []ResourceKey
	for k := range rr.types {
		if k.ResourceVersion.Group() == "apps" {
			preferredKeys = append(preferredKeys, k)
		}
	}
	for _, key := range preferredKeys {
		for k := range rr.types {
			if k.ResourceVersion.Group() == "extensions" && k.Kind == key.Kind {
				delete(rr.types, k)
				rr.aliases[k.EmptyVersion()] = key.EmptyVersion()
			}
		}
	}
	for key := range rr.types {
		rr.preferredVersions[key.EmptyVersion()] = key
	}
	return rr, nil
}

// HasResource returns a true if the supplied name is a valid resource.
func (r *ResourceRegistry) HasResource(key ResourceKey) bool {
	emptyKey := key.EmptyVersion()
	_, ok := r.preferredVersions[emptyKey]
	return ok
}

// ResourceInfo returns the information for the supplied type or an error if it was not found.
func (r *ResourceRegistry) ResourceInfo(key ResourceKey) (*ResourceInfo, error) {
	emptyKey := key.EmptyVersion()
	key, ok := r.preferredVersions[emptyKey]
	if !ok {
		return nil, fmt.Errorf("invalid type %v", key)
	}
	info := r.types[key]
	return &info, nil
}

// AllResources returns all resources
func (r *ResourceRegistry) AllResources() []ResourceInfo {
	var ret []ResourceInfo
	for _, v := range r.types {
		ret = append(ret, v)
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
