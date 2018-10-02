import * as oboe from "oboe";
import {IContextDetail, IContextList, IResource, IResourceList} from "../model/types";

export type listContextsCallback = (err: Error, result: IContextList) => void;
export type getContextsCallback = (err: Error, result: IContextDetail) => void;
export type listResourceCallback = (err: Error, result: IResourceList) => void;
export type getResourceCallback = (err: Error, result: IResource) => void;

export class Client {
    constructor(private baseURL: string) {
    }

    public listContexts(cb: listContextsCallback) {
        const url = this.baseURL + "/";
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    public getContext(context: string, cb: getContextsCallback) {
        const url = this.baseURL + `/${context}`;
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    public listResources(context: string, resourceName: string, ns: string, cb: listResourceCallback) {
        let url = `${this.baseURL}/${context}/resources/${resourceName}`;
        if (ns) {
            url += "?namespace=" + ns;
        }
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    public getResource(context: string, resourceName: string, ns: string, name: string, cb: getResourceCallback) {
        let url = `${this.baseURL}/${context}/resources/${resourceName}/${name}`;
        if (ns) {
            url += "?namespace=" + ns;
        }
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    private doError(url, err, cb) {
        const {body, statusCode, thrown} = err;
        if (thrown) {
            return cb(new Error(thrown.toString()));
        }
        if (body) {
            return cb(new Error(`${statusCode}:${body}`));
        }
        return cb(new Error(`unexpected error accessing ${url}`));
    }
}
