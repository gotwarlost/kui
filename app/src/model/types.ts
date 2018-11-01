
export interface IResourceMetadata {
    name: string;
    namespace?: string;
    labels: object;
    creationTimestamp?: string;
}

export interface IResource {
    kind: string;
    apiVersion: string;
    metadata: IResourceMetadata;
    spec: any;
    status: any;
}

export interface IResourceList {
    items: IResource[];
}

export interface IContextList {
    default: string;
    items: string[];
    errors?: string[];
}

export interface IResourceInfo {
    id: string;
    displayGroup: string;
    displayName: string;
    pluralName: string;
    isClusterResource: boolean;
}

export interface IResourceGroup {
    name: string;
    resources: IResourceInfo[];
}

export interface IContextDetail {
    defaultNamespace: string;
    resources: IResourceInfo[];
    preferredVersions: object;
    aliases: object;
}

// ResourceQuery is a query for a list or a single object.
export class ResourceQuery {
    public k8sContext: string; // context name
    public resourceType: string; // resource type
    public namespace?: string; // optional namespace
    public objectId?: string; // object id
    public params?: object; // query params
}

// ResourceQueryResults encapsulates all the phases of executing a query
// including the initial wait, error conditions and results.
export class ResourceQueryResults {
    public query: ResourceQuery;
    public loading?: boolean;
    public results?: IResource | IResourceList;
    public err?: Error;
}

export interface IResultsPath {
    path: string;
    queryName?: string;
}

export interface IQueryWithLocation {
    query: ResourceQuery;
    location: IResultsPath;
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
    public resourceTypes: string[];
}

// ObjectSelection is the selection of a single object.
export class ObjectSelection {
    public resourceType: string;
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
