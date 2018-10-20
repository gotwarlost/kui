package server

import (
	"github.com/gotwarlost/kui/pkg/registry"
)

type ContextList struct {
	DefaultContext string   `json:"default"`
	Items          []string `json:"items"`
	Errors         []string `json:"errors"`
}

type ClusterResource struct {
	ID                string `json:"id"`
	DisplayGroup      string `json:"displayGroup"`
	DisplayName       string `json:"displayName"`
	PluralName        string `json:"pluralName"`
	IsClusterResource bool   `json:"isClusterResource"`
}

func fromResource(r registry.ResourceInfo) ClusterResource {
	var displayGroup = r.Key.ResourceVersion.Group()
	if displayGroup == "apps" || displayGroup == "extensions" {
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

type ContextDetail struct {
	DefaultNamespace string            `json:"defaultNamespace"`
	Resources        []ClusterResource `json:"resources"`
}
