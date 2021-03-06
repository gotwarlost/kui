// Package kubeconfig provides support for reading kubernetes config files.
package kubeconfig

import (
	"sort"

	"github.com/pkg/errors"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
)

// Config provides context and cluster information from a set of kubeconfig files.
type Config struct {
	rc      api.Config
	names   []string
	nameMap map[string]bool
}

// New returns a configuration given the set of kubeconfig files to be loaded in order.
// If the specified set has zero length, defaults are used (i.e. KUBECONFIG environment variable or ~/.kube/config)
func New(kcFiles []string) (*Config, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	if len(kcFiles) > 0 {
		loadingRules.Precedence = kcFiles
	}
	configOverrides := &clientcmd.ConfigOverrides{}
	kc := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(loadingRules, configOverrides)
	c, err := kc.RawConfig()
	if err != nil {
		return nil, errors.Wrap(err, "get raw config")
	}

	var names []string
	m := map[string]bool{}
	if c.Contexts != nil {
		for k := range c.Contexts {
			names = append(names, k)
			m[k] = true
		}
		sort.Strings(names)
	}
	return &Config{
		rc:      c,
		names:   names,
		nameMap: m,
	}, nil
}

// ContextNames returns a list of context names available in the k8s config.
func (c *Config) ContextNames() []string {
	return c.names
}

// IsValidContext returns true if the supplied context name is found in the config.
func (c *Config) IsValidContext(ctx string) bool {
	return c.nameMap[ctx]
}

// CurrentContext returns the current context set in the config.
func (c *Config) CurrentContext() string {
	return c.rc.CurrentContext
}

// DefaultNamespaceForContext returns the default namespace set for the specified context,
// defaulting to the "default" namespace.
func (c *Config) DefaultNamespaceForContext(ctx string) string {
	def := "default"
	if c.rc.Contexts == nil {
		return def
	}
	context := c.rc.Contexts[ctx]
	if context == nil {
		return def
	}
	if context.Namespace == "" {
		return def
	}
	return context.Namespace
}

// RESTConfig returns the REST configuration for the supplied context that can be used to
// create a k8s client.
func (c *Config) RESTConfig(context string) (*rest.Config, error) {
	conf := clientcmd.NewDefaultClientConfig(c.rc, &clientcmd.ConfigOverrides{CurrentContext: context})
	rc, err := conf.ClientConfig()
	if err != nil {
		return nil, errors.Wrap(err, "get client config")
	}
	return rc, nil
}
