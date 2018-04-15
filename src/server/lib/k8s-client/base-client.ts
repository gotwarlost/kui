import * as hyperquest from "hyperquest";
import * as JSONStream from "JSONStream";
import * as Rx from "rxjs/Rx";
import * as types from "./types";

class HTTPError extends Error {
    constructor(public code: number, message: string) {
        super(message);
    }
}

class AuthError extends HTTPError {
}

class BadRequestError extends HTTPError {
}

class NotFoundError extends HTTPError {
}

const isSuccess = (res) => {
    return res.statusCode >= 200 && res.statusCode < 300;
};

export class BaseClient {
    protected static fullJSON(observer) {
        const s = JSONStream.parse(null);
        let record;
        s.on("data", (item) => {
            record = item;
        });
        s.on("end", () => {
            observer.next(record);
            observer.complete();
        });
        return s;
    }

    protected constructor(protected clientOpts: types.IClientOptions) {
    }

    protected doRequest(url, reqOpts, streamProvider): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>): void => {
            this.doStreamingRequest(url, reqOpts, (err, res, stream) => {
                if (err) {
                    return observer.error(err);
                }
                if (!isSuccess(res)) {
                    this.collectError(stream, res.statusCode, (finalErr) => {
                        observer.error(finalErr);
                    });
                    return;
                }
                const s = streamProvider(observer);
                stream.pipe(s);
            });
        });
    }

    protected makeOpts(method: string = "GET") {
        const ret: any = {
            gzip: true,
            headers: {
                "Content-Type": (method === "PATCH" ? "application/json-patch+json" : "application/json"),
            },
            method,
        };
        const auth = this.clientOpts.auth || {};
        if ((auth as types.ITokenAuth).token) {
            const ta = auth as types.ITokenAuth;
            ret.headers.authorization = `bearer ${ta.token}`;
        } else if ((auth as types.IUserPasswordAuth).username) {
            const upa = auth as types.IUserPasswordAuth;
            ret.auth = `${upa.username}:${upa.password}`;
        } else if ((auth as types.ICredentialsAuth).keyPEM) {
            const cra = auth as types.ICredentialsAuth;
            ret.key = cra.keyPEM;
            ret.cert = cra.certPEM;
        }
        if (this.clientOpts.caCertPEM) {
            ret.ca = this.clientOpts.caCertPEM;
        }
        const strictSSL = this.clientOpts.strictSSL === undefined ? !!ret.ca : this.clientOpts.strictSSL;
        ret.rejectUnauthorized = !strictSSL;
        return ret;
    }

    private doStreamingRequest(url, reqOpts, cb) {
        const hq = hyperquest(url, reqOpts, (err, res) => {
            return cb(err, res, hq);
        });
    }

    private collectError(stream, code: number, callback) {
        const buffers = [];
        stream.on("data", (data) => buffers.push(data));
        stream.on("end", () => callback(this.createError(code, Buffer.concat(buffers).toString())));
    }

    private createError(code: number, msg: string): HTTPError {
        let err;
        switch (code) {
            case 401:
            case 403:
                err = new AuthError(code, msg);
                break;
            case 400:
                err = new BadRequestError(code, msg);
                break;
            case 404:
                err = new NotFoundError(code, msg);
                break;
            default:
                err = new HTTPError(code, msg);
                break;
        }
        return err;
    }
}
