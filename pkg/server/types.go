package server

import "github.com/gotwarlost/kui/pkg/registry"

type ContextList struct {
	DefaultContext string   `json:"default"`
	Items          []string `json:"items"`
	Errors         []string `json:"errors"`
}

type ClusterResource struct {
	Name              string `json:"name"`
	DisplayName       string `json:"displayName"`
	PluralName        string `json:"pluralName"`
	IsClusterResource bool   `json:"isClusterResource"`
}

func fromResource(r registry.ResourceInfo) ClusterResource {
	return ClusterResource{
		Name:              r.Name,
		DisplayName:       r.DisplayName,
		PluralName:        r.PluralName,
		IsClusterResource: r.IsClusterResource,
	}
}

type ContextDetail struct {
	DefaultNamespace string            `json:"defaultNamespace"`
	Resources        []ClusterResource `json:"resources"`
}
