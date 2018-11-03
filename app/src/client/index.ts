import * as oboe from "oboe";
import {IContextDetail, IContextList, IResource, IResourceList} from "../model/types";

export type listContextsCallback = (err: Error, result: IContextList) => void;
export type getContextsCallback = (err: Error, result: IContextDetail) => void;
export type listResourceCallback = (err: Error, result: IResourceList) => void;
export type getResourceCallback = (err: Error, result: IResource) => void;

export class AuthzError extends Error {
    private authzError: boolean;

    constructor(msg) {
        super(msg);
        this.authzError = true;
    }
}

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

    public listResources(context: string, resourceName: string, ns: string, params: object, cb: listResourceCallback) {
        let url = `${this.baseURL}/${context}/resources?res=${resourceName}`;
        if (ns) {
            url += "&namespace=" + ns;
        }
        url = this.addParams(url, params);
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    public getResource(context: string, resourceName: string, ns: string, name: string,
                       params: object, cb: getResourceCallback) {
        let url = `${this.baseURL}/${context}/resources/${name}?res=${resourceName}`;
        if (ns) {
            url += "&namespace=" + ns;
        }
        url = this.addParams(url, params);
        const stream = oboe({url});
        stream.on("fail", (err) => this.doError(url, err, cb));
        stream.on("done", (obj) => cb(null, obj));
    }

    private doError(url, err, cb) {
        const {body, statusCode, thrown} = err;
        if (thrown) {
            return cb(new Error(thrown.toString()));
        }
        if (statusCode < 200 || statusCode >= 300) {
            const msg = `unexpected error accessing ${url}\nstatus code: ${statusCode}, body: ${body}`;
            if (statusCode === 403) {
                return cb(new AuthzError(msg));
            }
            return cb(new Error(msg));
        }
        if (body) {
            return cb(new Error(`${statusCode}:${body}`));
        }
        return cb(new Error(`unexpected error accessing ${url}`));
    }

    private addParams(url: string, params: object): string {
        if (params) {
            Object.keys(params).forEach( (p) => {
                url += "&" + p + "=" + escape(params[p]);
            });
        }
        return url;
    }
}
