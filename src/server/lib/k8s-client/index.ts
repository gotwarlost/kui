import {Observable} from "rxjs/Rx";
import {Metadata} from "./metadata";
import {Resource} from "./resource";
import * as types from "./types";
import {ResourceRegistry} from "./types";

export * from "./types";

export class Client {
    public constructor(private opts: types.IClientOptions) {
    }

    public resource(rp: types.IResourcePath): Observable<Resource> {
        return Observable.from([new Resource(this.opts, rp)]);
    }

    public registry(): Observable<ResourceRegistry> {
        const m = new Metadata(this.opts);
        return m.getRegistry();
    }
}
