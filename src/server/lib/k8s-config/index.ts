import * as fs from "fs";
import * as yaml from "js-yaml";
import {map, reduce, tap} from "rxjs/operators";
import {Observable} from "rxjs/Rx";
import {
    Auth,
    Client, ResourceRegistry,
} from "../k8s-client";

interface IK8sClusterInfo {
    server: string;
    "certificate-authority-data"?: string;
    "insecure-skip-tls-verify"?: boolean;
}

interface IK8sCluster {
    name: string;
    cluster: IK8sClusterInfo;
}

interface IK8sUserInfo {
    "client-certificate"?: string;
    "client-key"?: string;
    "client-certificate-data"?: string;
    "client-key-data"?: string;
    token?: string;
    username?: string;
    password?: string;
}

interface IK8sUser {
    name: string;
    user: IK8sUserInfo;
}

interface IK8sContextInfo {
    cluster: string;
    user: string;
    namespace?: string;
}

interface IK8sContext {
    name: string;
    context: IK8sContextInfo;
}

interface IK8sConfig {
    clusters?: IK8sCluster[];
    users?: IK8sUser[];
    contexts?: IK8sContext[];
    "current-context"?: string;
}

const defaultCluster = (): IK8sClusterInfo => {
    return {server: "http://localhost:8080"};
};

const defaultUser = (): IK8sUserInfo => {
    return {};
};

const defaultContext = (): IK8sContextInfo => {
    return {
        cluster: "",
        user: "",
    };
};

export class Context {
    public constructor(private id: string,
                       private def: string,
                       private cl: Observable<Client>,
                       private reg: Observable<ResourceRegistry>) {
    }

    public name(): string {
        return this.id;
    }

    public defaultNamespace(): string {
        return this.def;
    }

    public registry(): Observable<ResourceRegistry> {
        return this.reg;
    }

    public client(): Observable<Client> {
        return this.cl;
    }
}

interface IUserMap {
    [key: string]: IK8sUserInfo;
}

interface IContextMap {
    [key: string]: IK8sContextInfo;
}

interface IClusterMap {
    [key: string]: IK8sClusterInfo;
}

interface IRegistryMap {
    [key: string]: ResourceRegistry;
}

export class Contexts {
    private readonly users: IUserMap;
    private readonly contexts: IContextMap;
    private readonly clusters: IClusterMap;
    private readonly loadErrors: string[];
    private readonly registryMap: IRegistryMap;
    private current: string;

    constructor() {
        this.clusters = {};
        this.users = {};
        this.contexts = {};
        this.loadErrors = [];
        this.registryMap = {};
        this.current = "";
    }

    public addConfig(c: IK8sConfig) {
        const maybeAdd = (root, name, obj) => {
            if (name && !root[name]) {
                root[name] = obj;
            }
        };
        (c.clusters || []).forEach((cluster) => {
            maybeAdd(this.clusters, cluster.name, cluster.cluster);
        });
        (c.users || []).forEach((user) => {
            maybeAdd(this.users, user.name, user.user);
        });
        (c.contexts || []).forEach((ctx) => {
            maybeAdd(this.contexts, ctx.name, ctx.context);
        });
        if (!this.current && c["current-context"]) {
            this.current = c["current-context"];
        }
    }

    public addLoadError(err: string) {
        this.loadErrors.push(err);
    }

    public names(): string[] {
        const ret = Object.keys(this.contexts);
        ret.sort();
        return ret;
    }

    public currentContext(): string {
        return this.current;
    }

    public defaultNamespaceForContext(ctx: string): string {
        const c = this.contexts[ctx];
        if (c) {
            return c.namespace;
        }
        return "";
    }

    public getLoadErrors(): string[] {
        return this.loadErrors;
    }

    public getContext(ctx: string): Observable<Context> {
        const context = this.contexts[ctx];
        if (!context) {
            return Observable.create((observer) => observer.error(new Error(`invalid context ${ctx}`)));
        }
        return Observable.create((observer) => {
            observer.next(new Context(
                ctx,
                context.namespace,
                this.contextClient(ctx),
                this.contextRegistry(ctx),
            ));
            observer.complete();
        });
    }

    private contextClient(ctx: string): Observable<Client> {
        const base = Observable.create((observer) => {
            // simplify the impl and do synchronous stuff. fix it later.
            const context = this.contexts[ctx] || defaultContext();
            const cluster = this.clusters[context.cluster] || defaultCluster();
            const user = this.users[context.user] || defaultUser();
            const ca = this.getEmbeddedOrFilePEM(
                cluster["certificate-authority-data"],
                cluster["certificate-authority"],
            );

            let auth: Auth = null;
            if (user.token) {
                auth = {token: user.token};
            } else if (user.username && user.password) {
                auth = {username: user.username, password: user.password};
            } else {
                const ck = this.getEmbeddedOrFilePEM(user["client-key-data"], user["client-key"]);
                const cc = this.getEmbeddedOrFilePEM(user["client-certificate-data"], user["client-certificate"]);
                if (ck && cc) {
                    auth = {keyPEM: ck, certPEM: cc};
                }
            }
            const c = new Client({
                auth,
                baseURL: cluster.server,
                caCertPEM: ca,
                strictSSL: !!ca,
            });
            observer.next(c);
            observer.complete();
        });
        return base;
    }

    private getEmbeddedOrFilePEM(pemData: string, file: string): Buffer {
        const fromBase64 = (s: string): Buffer => {
            return new Buffer(s, "base64");
        };
        try {
            if (pemData) {
                return fromBase64(pemData);
            }
            if (file) {
                return fs.readFileSync(file);
            }
        } catch (ex) {
            // tslint:disable-next-line:no-console
            console.error("unable to read data from", file);
            return null;
        }
    }

    private contextRegistry(ctx: string): Observable<ResourceRegistry> {
        const context = this.contexts[ctx] || defaultContext();
        const cluster = this.clusters[context.cluster] || defaultCluster();
        const reg = this.registryMap[cluster.server];
        if (reg) {
            return Observable.from([reg]);
        }
        return Observable.create((observer) => {
            this.contextClient(ctx)
                .flatMap((client: Client) => client.registry())
                .subscribe(
                    (r: ResourceRegistry) => this.registryMap[cluster.server] = r,
                    (err) => observer.error(err),
                    () => {
                        observer.next(this.registryMap[cluster.server]);
                        observer.complete();
                    },
                );
        });
    }
}

interface IFileTimes {
    [key: string]: number;
}

// Config represents a set of kubernetes config files loaded in order
// and provides information on all contexts in the files.
export class Config {
    private files: string[];
    private cached: Contexts;
    private fileTimes: IFileTimes;

    public constructor(files: string[]) {
        files = files.filter((f) => f !== "");
        this.files = files;
        this.fileTimes = {};
        this.cached = null;
    }

    public getContexts(): Observable<Contexts> {
        return this.maybeInvalidateCache().flatMap(() => {
            if (!this.cached) {
                return this.contextLoader().pipe(tap((c) => this.cached = c));
            }
            return Observable.from([this.cached]);
        });
    }

    private getFileTimes(): Observable<IFileTimes> {
        const safeStat = (file): Observable<fs.Stats> => {
            return Observable.create((observer) => {
                fs.stat(file, (err, stats) => {
                    if (!err) {
                        observer.next(stats);
                    }
                    observer.complete();
                });
            });
        };
        const list = this.files.map((file) => {
            return safeStat(file).pipe(map((stat) => ({file, time: stat.mtime.getTime()})));
        });
        return Observable.merge(...list).pipe(reduce((acc, x: any) => {
            acc[x.file] = x.time;
            return acc;
        }, {}));
    }

    private maybeInvalidateCache(): Observable<number> {
        return this.getFileTimes().map((curr: IFileTimes) => {
            let count = 0;
            Object.keys(curr).forEach((k) => {
                if (this.fileTimes[k] !== curr[k]) {
                    count++;
                }
            });
            this.fileTimes = curr;
            return count;
        }).pipe(tap((n) => {
            if (n > 0) {
                this.cached = null;
            }
        }));
    }

    private contextLoader(): Observable<Contexts> {
        const safeRead = (ctxs: Contexts, file: string): Observable<IK8sConfig> => {
            return Observable.create((observer) => {
                fs.readFile(file, "utf-8", (err, contents) => {
                    if (err) {
                        ctxs.addLoadError(`error loading ${file}, ${err.message}`);
                    } else {
                        try {
                            const c = yaml.safeLoad(contents) as IK8sConfig;
                            if (!c) {
                                ctxs.addLoadError(`unable to load YAML from ${file}`);
                            } else {
                                observer.next(c);
                            }
                        } catch (ex) {
                            ctxs.addLoadError(`unable to load YAML from ${file}, ${ex.message}`);
                        }
                    }
                    observer.complete();
                });
            });
        };
        const ret = new Contexts();
        const readers = this.files.map((file) => safeRead(ret, file));
        const reducer = (ctxs: Contexts, info: IK8sConfig): Contexts => {
            ctxs.addConfig(info);
            return ctxs;
        };
        return Observable.concat(...readers).pipe(reduce(reducer, ret));
    }
}

export const
    load = (files: string[]): Config => {
        return new Config(files);
    };
