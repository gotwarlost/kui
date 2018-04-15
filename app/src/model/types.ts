import {IContextDetail, IResource, IResourceList} from "kui-shared-types";

// model objects shouldn't need a client dependency in any way.
// re-export the things they need.
export {IContextDetail, IResource, IResourceInfo, IResourceList} from "kui-shared-types";

// ResourceQuery is a query for a list or a single object.
export class ResourceQuery {
    public k8sContext: string; // context name
    public resourceName: string; // resource name
    public namespace?: string; // optional namespace
    public objectName?: string; // object name
}

// ResourceQueryResults encapsulates all the phases of executing a query
// including the initial wait, error conditions and results.
export class ResourceQueryResults {
    public query: ResourceQuery;
    public loading?: boolean;
    public results?: IResource | IResourceList;
    public err?: Error;
}

export enum QueryScope {
    SINGLE_NAMESPACE = "SINGLE_NAMESPACE",
    ALL_NAMESPACES = "ALL_NAMESPACES",
    CLUSTER_OBJECTS = "CLUSTER_OBJECTS",
}

// NamespaceSelection is the selection around namespaces that includes
// a single namespace, all namespaces, and cluster objects
// (namespace is irrelevant in the last case).
export class NamespaceSelection {
    public scope: QueryScope;
    public namespace: string;
}

// has the selected context name and associated details of the context.
export class ContextCache {
    public contextName: string;
    public loading?: boolean;
    public detail?: IContextDetail;
    public err?: Error;
}

// has the selected context name and associated details of the context.
export class NamespaceListCache {
    public contextName: string;
    public loading?: boolean;
    public namespaces?: string[];
    public err?: Error;
}

export class ListPageSelection {
    public title: string;
    public resources: string[];
}

// ObjectSelection is the selection of a single object.
export class ObjectSelection {
    public resourceName: string;
    public namespace: string;
    public name: string;
}

// Selection is the current selection as inferred from the route path.
export class Selection {
    public context?: string;
    public namespace?: NamespaceSelection;
    public list?: ListPageSelection;
    public object?: ObjectSelection;
}
