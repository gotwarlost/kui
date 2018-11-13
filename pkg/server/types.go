package server

import (
	"strings"

	"github.com/gotwarlost/kui/pkg/registry"
)

// ContextList provides a list of available contexts and the default context.
// Load errors are populated in the Errors field.
type ContextList struct {
	DefaultContext string   `json:"default"` // the default context
	Items          []string `json:"items"`   // the list of context names
	Errors         []string `json:"errors"`  // load errors, if any
}

// ClusterResource provides information about a supported resource in the cluster.
type ClusterResource struct {
	ID                string `json:"id"`                // the ID of the resource as the string value of the resource key
	DisplayGroup      string `json:"displayGroup"`      // the display group
	DisplayName       string `json:"displayName"`       // display name
	PluralName        string `json:"pluralName"`        // plural name for display
	IsClusterResource bool   `json:"isClusterResource"` // true if not namespaced
}

// fromResource adapts the registry type to the API type.
func fromResource(r registry.ResourceInfo) ClusterResource {
	var displayGroup = r.Key.ResourceVersion.Group()
	if pos := strings.Index(displayGroup, "."); pos < 0 {
		displayGroup = ""
	}
	return ClusterResource{
		ID:                r.Key.String(),
		DisplayName:       r.DisplayName,
		DisplayGroup:      displayGroup,
		PluralName:        r.PluralName,
		IsClusterResource: r.IsClusterResource,
	}
}

// ContextDetail returns information for a single context, including the default namespace,
// list of resources, aliases and preferred versions.
type ContextDetail struct {
	DefaultNamespace  string            `json:"defaultNamespace"`  // default namespace
	Resources         []ClusterResource `json:"resources"`         // list of resources for the cluster
	Aliases           map[string]string `json:"aliases"`           // alias types where both key and value have empty versions
	PreferredVersions map[string]string `json:"preferredVersions"` // preferred versions where empty version keys are mapped to real ones
}
