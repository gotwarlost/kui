import * as express from "express";
import * as fs from "fs";
import {IContextDetail, IContextList} from "kui-shared-types";
import * as path from "path";
import {first} from "rxjs/operators";
import {IResourcePath} from "./lib/k8s-client";
import {Config, Context} from "./lib/k8s-config";
import {projectionFor} from "./list-projection";

const nsQueryParam = "namespace";

class RequestParams {
    public static get(req): RequestParams {
        return req._params || {};
    }

    public static addContext(req, context: string, contextObject: Context) {
        req._params = {
            ...this.get(req),
            context,
            contextObject,
        } as RequestParams;
    }

    public static addResource(req, resourcePath: IResourcePath) {
        req._params = {
            ...this.get(req),
            resourcePath,
        } as RequestParams;
    }

    public static addObjectId(req, objectID: string) {
        req._params = {
            ...this.get(req),
            objectID,
        } as RequestParams;
    }

    public context?: string;
    public contextObject: Context;
    public resourcePath?: IResourcePath;
    public objectID?: string;
}

const extractErrorCode = (err): number => {
    if (err && err.code && typeof err.code === "number") {
        return err.code || 500;
    }
    return 500;
};

const sendError = (res, err) => {
    res.status(extractErrorCode(err)).send(err.message).end();
};

class Routes {
    constructor(private config: Config) {
    }

    public listContexts(req, res, next) {
        this.config.getContexts().pipe(first()).subscribe(
            (ctxs) => {
                const names = ctxs.names();
                const output: IContextList = {
                    default: ctxs.currentContext(),
                    errors: ctxs.getLoadErrors(),
                    items: names,
                };
                res.json(output);
            },
            (err) => {
                return next(err);
            },
        );
    }

    public getContext(req, res) {
        const {contextObject} = RequestParams.get(req);
        contextObject.registry().pipe(first()).subscribe(
            (reg) => {
                const info = reg.getAllResources().map((ri) => ({
                    displayName: ri.displayName,
                    isClusterResource: ri.isClusterResource,
                    name: ri.resourceName,
                    pluralName: ri.pluralName,
                }));
                const detail: IContextDetail = {
                    defaultNamespace: contextObject.defaultNamespace() || null,
                    resources: info,
                };
                res.json(detail);
            },
            (err) => sendError(res, err),
        );
    }

    public listResources(req, res) {
        const {contextObject, resourcePath} = RequestParams.get(req);
        contextObject.client()
            .flatMap((c) => c.resource(resourcePath))
            .flatMap((r) => r.list({projection: projectionFor(resourcePath.resourceName)}))
            .subscribe(
                (data) => res.json(data),
                (err) => sendError(res, err),
            );
    }

    public getResource(req, res) {
        const {contextObject, resourcePath, objectID} = RequestParams.get(req);
        contextObject.client()
            .flatMap((c) => c.resource(resourcePath))
            .flatMap((r) => r.get(objectID))
            .subscribe(
                (data) => res.json(data),
                (err) => sendError(res, err),
            );
    }
}

export const create = (staticServerPath: string, config: Config) => {
    let rootContent: string = "";
    try {
        rootContent = fs.readFileSync(path.resolve(staticServerPath, "index.html"), "utf8");
    } catch (ex) {
        // tslint:disable-next-line:no-console
        console.error("[warn] no index.html at static server path");
    }
    const staticApp = express();
    staticApp.use(express.static(staticServerPath));

    const contextApp = express();

    const routes = new Routes(config);
    const router = express.Router();
    router.param("context", (req, res, next, ctx) => {
        config.getContexts().pipe(first()).flatMap((c) => c.getContext(ctx))
            .subscribe(
                (context) => {
                    RequestParams.addContext(req, ctx, context);
                    next();
                },
                (err) => sendError(res, err),
            );
    });
    router.param("resource", (req, res, next, resource) => {
        const {contextObject} = RequestParams.get(req);
        contextObject.registry().pipe(first()).subscribe(
            (rr) => {
                const td = rr.getResourceInfo(resource);
                if (!td) {
                    return next(new Error(`invalid resource: '${resource}'`));
                }
                const ns = req.query[nsQueryParam] || "";
                RequestParams.addResource(req, {
                    namespace: td.isClusterResource ? "" : ns,
                    prefix: td.prefix,
                    resourceName: resource,
                    version: td.version,
                });
                next();
            },
            (err) => sendError(res, err),
        );
    });
    router.param("id", (req, res, next, id) => {
        RequestParams.addObjectId(req, id);
        next();
    });

    router.get("/", routes.listContexts.bind(routes));
    router.get(`/:context`, routes.getContext.bind(routes));
    router.get(`/:context/resources/:resource`, routes.listResources.bind(routes));
    router.get(`/:context/resources/:resource/:id`, routes.getResource.bind(routes));
    contextApp.use(router);

    const app = express();
    app.use("/ui", (req, res) => res.send(rootContent).end());
    app.use("/api/contexts", contextApp);
    app.use(staticApp);
    return app;
};
