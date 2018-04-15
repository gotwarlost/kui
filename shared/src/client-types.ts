
export interface IResourceMetadata {
    name: string;
    namespace?: string;
    selfLink: string;
    uid: string;
    resourceVersion: string;
    generation?: number;
    creationTimestamp: string;
    labels: object;
    annotations: object;
}

export interface IResource {
    kind: string;
    apiVersion: string;
    metadata: IResourceMetadata;
    spec: any;
    status: any;
}

export interface IResourceList {
    kind?: string;
    apiVersion?: string;
    items: IResource[];
}

export interface IContextList {
    default: string;
    items: string[];
    errors?: string[];
}

export interface IResourceInfo {
    name: string;
    isClusterResource: boolean;
    displayName: string;
    pluralName: string;
}

export interface IContextDetail {
    defaultNamespace: string;
    resources: IResourceInfo[];
}
