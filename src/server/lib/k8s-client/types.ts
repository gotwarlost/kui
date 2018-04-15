export type Projection = (item) => object;

export interface IResourceListOptions {
    continue?: string;
    fieldSelector?: string;
    includeUninitialized?: boolean;
    labelSelector?: string;
    limit?: number;
    timeoutSeconds?: number;
    projection?: Projection;
}

export interface IResourceWatchOptions {
    fieldSelector?: string;
    includeUninitialized?: boolean;
    labelSelector?: string;
    resourceVersion?: string;
    timeoutSeconds?: number;
}

export interface IResourceListMetadata {
    selfLink: string;
    resourceVersion: string;
    continue?: string;
}

export interface IResourceList {
    kind?: string;
    apiVersion?: string;
    metadata?: IResourceListMetadata;
    items: any[];
}

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

export interface IUserPasswordAuth {
    username: string;
    password: string;
}

export interface ITokenAuth {
    token: string;
}

export interface ICredentialsAuth {
    keyPEM: Buffer;
    certPEM: Buffer;
}

export type Auth = IUserPasswordAuth | ITokenAuth | ICredentialsAuth;

export interface IResourcePath {
    prefix: string;     // e.g. "/api" or "/apis"
    version: string;    // e.g "v1", "extensions/v1beta1"
    resourceName: string; // e.g. "pods", "deployments"
    namespace?: string; // optional namespace
}

export interface IClientOptions {
    baseURL: string;
    auth?: Auth;
    caCertPEM?: Buffer;
    strictSSL?: boolean;
}

const wordRE = /([a-z])([A-Z])/g;
const cyMatch = /cy$/;

export class ResourceInfo {
    public displayName: string;
    public pluralName: string;

    public constructor(public resourceName: string,
                       public kind: string,
                       public isClusterResource: boolean,
                       public prefix: string,
                       public version: string) {

        this.displayName = kind.replace(wordRE, "$1 $2");
        let pluralName = "";
        let matching = true;
        for (let i = 0; i < resourceName.length; i++) {
            if (matching && kind[i] && (kind[i].toLowerCase() === resourceName[i])) {
                pluralName += kind[i];
            } else {
                matching = false;
                pluralName += resourceName[i];
            }
        }
        this.pluralName = pluralName.replace(wordRE, "$1 $2");
    }

    public getResourcePath(namespace: string): IResourcePath {
        const ret: IResourcePath = {
            prefix: this.prefix,
            resourceName: this.resourceName,
            version: this.version,
        };
        if (!this.isClusterResource && namespace) {
            ret.namespace = namespace;
        }
        return ret;
    }
}

interface IResourceMap {
    [key: string]: ResourceInfo;
}

export class ResourceRegistry {
    public constructor(private typeMap: IResourceMap) {
    }

    public hasResource(name: string): boolean {
        return !!this.typeMap[name];
    }

    public getResourceInfo(name: string): ResourceInfo {
        return this.typeMap[name];
    }

    public getAllResources(): ResourceInfo[] {
        return this.getResources((t) => true);
    }

    public getNamespacedResources(): ResourceInfo[] {
        return this.getResources((t) => !t.isClusterResource);
    }

    public getClusterResources(): ResourceInfo[] {
        return this.getResources((t) => t.isClusterResource);
    }

    private getResources(filter): ResourceInfo[] {
        const ret: ResourceInfo[] = [];
        Object.keys(this.typeMap).forEach((k) => {
            const t = this.typeMap[k];
            if (filter(t)) {
                ret.push(t);
            }
        });
        ret.sort((a, b) => {
            if (a.displayName < b.displayName) {
                return -1;
            }
            if (a.displayName > b.displayName) {
                return 1;
            }
            return 0;
        });
        return ret;
    }
}
