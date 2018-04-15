import * as JSONStream from "JSONStream";
import * as querystring from "querystring";
import {Observable} from "rxjs/Rx";
import {BaseClient} from "./base-client";
import * as types from "./types";

export class Resource extends BaseClient {
    public constructor(clientOpts: types.IClientOptions, private resPath: types.IResourcePath) {
        super(clientOpts);
    }

    public list(opts?: types.IResourceListOptions): Observable<types.IResourceList> {
        opts = opts || {};
        const qs = querystring.stringify(opts);
        const url = this.makeURL() + (qs ? "?" + qs : "");
        const reqOpts = this.makeOpts();
        return this.doRequest(url, reqOpts, (observer) => {
            const s = JSONStream.parse("items.*");
            let header = {};
            const items = [];
            s.on("header", (item) => header = item);
            s.on("data", (item) => {
                if (opts.projection) {
                    try {
                        item = opts.projection(item);
                    } catch (ex) {
                        item = {msg: "projection error", err: ex};
                    }
                }
                items.push(item);
            });
            s.on("end", () => {
                observer.next({
                    ...header,
                    items,
                });
                observer.complete();
            });
            return s;
        });
    }

    public get(name: string): Observable<types.IResource> {
        const url = this.makeURL(name);
        const reqOpts = this.makeOpts();
        return this.doRequest(url, reqOpts, BaseClient.fullJSON);
    }

    private makeURL(name?: string): string {
        return this.clientOpts.baseURL +
            this.resPath.prefix +
            "/" + this.resPath.version +
            (this.resPath.namespace ? "/namespaces/" + this.resPath.namespace : "") +
            "/" + this.resPath.resourceName +
            (name ? "/" + name : "");
    }
}
