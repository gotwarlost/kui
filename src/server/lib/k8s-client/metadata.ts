import * as JSONStream from "JSONStream";
import {Observable} from "rxjs/Rx";
import {BaseClient} from "./base-client";
import * as types from "./types";
import {ResourceRegistry} from "./types";

class ResourceWithPreference {
    constructor(public resourceInfo: types.ResourceInfo,
                public preferred: boolean) {
    }
}

interface IGroupVersion {
    groupVersion: string;
}

interface IResourceGroup {
    prefix: string;
    versions: IGroupVersion[];
    preferredVersion: IGroupVersion;
}

export class Metadata extends BaseClient {
    public constructor(clientOpts: types.IClientOptions) {
        super(clientOpts);
    }

    public getRegistry(): Observable<ResourceRegistry> {
        const typeMap = {};
        return Observable.create((observer): void => {
            const resources = this.groups().flatMap((g) => this.resourcesForGroup(g));
            resources.subscribe({
                complete: () => {
                    const out = {};
                    Object.keys(typeMap).forEach((k) => out[k] = typeMap[k].resourceInfo);
                    observer.next(new ResourceRegistry(out));
                    observer.complete();
                },
                error: (e) => observer.error(e),
                next: (r) => {
                    const name = r.resourceInfo.resourceName;
                    const existing = typeMap[name];
                    let overwrite = true;
                    if (existing && existing.preferred) {
                        overwrite = false;
                        if (r.preferred && existing.resourceInfo.version.startsWith("extensions")) {
                            overwrite = true;
                        }
                    }
                    if (overwrite) {
                        typeMap[name] = r;
                    }
                },
            });
        });
    }

    private resources(prefix: string, version: string, preferred: boolean): Observable<ResourceWithPreference> {
        const sp = (observer) => {
            const s = JSONStream.parse("resources.*");
            s.on("data", (item) => {
                const name = item.name;
                if (name.indexOf("/") >= 0) {
                    return;
                }
                const verbMap = { get: false, list: false};
                (item.verbs || []).forEach((x) => verbMap[x] = true);
                if (!(verbMap.get && verbMap.list)) {
                    return;
                }
                const ri = new types.ResourceInfo(item.name, item.kind, !item.namespaced, prefix, version);
                observer.next(new ResourceWithPreference(ri, preferred));
            });
            s.on("end", () => {
                observer.complete();
            });
            return s;
        };
        return this.doRequest(this.clientOpts.baseURL + prefix + "/" + version, this.makeOpts(), sp);
    }

    private groups(): Observable<IResourceGroup> {
        const base = {
            preferredVersion: {groupVersion: "v1"},
            prefix: "/api",
            versions: [{groupVersion: "v1"}],
        };
        const sp = (observer) => {
            observer.next(base);
            const s = JSONStream.parse("groups.*");
            s.on("data", (item) => {
                item.prefix = "/apis";
                observer.next(item);
            });
            s.on("end", () => {
                observer.complete();
            });
            return s;
        };
        return this.doRequest(this.clientOpts.baseURL + "/apis", this.makeOpts(), sp);
    }

    private resourcesForGroup(g: IResourceGroup): Observable<ResourceWithPreference> {
        const obList = g.versions.map((v) => {
            return this.resources(g.prefix, v.groupVersion, v.groupVersion === g.preferredVersion.groupVersion);
        });
        return Observable.merge(...obList);
    }
}
