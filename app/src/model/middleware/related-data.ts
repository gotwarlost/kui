import {Client} from "../../client";
import {ActionFactory, ActionTypes, IDataResult} from "../actions";
import {ContextCache, IContextDetail, IQueryWithLocation, IResource, ResourceQuery} from "../types";
import {StandardResourceTypes, toSelectorString, versionlessResourceType} from "../../util";
import {loadList, loadDetail} from "./state-watch";
import {State} from "../state";

export const loadRelatedData = (client: Client) => ({dispatch, getState}) => (next) => (action) => {
    next(action);
    const state = getState() as State;
    if (action.type !== ActionTypes.DATA_RESULT) { // only on result load
        return null;
    }
    const a = action as IDataResult;
    if (!a.qr.query.objectId) { // only when query is a detail query
        return null;
    }
    const item = a.qr.results as IResource;
    if (!item) { // only when item found
        return null;
    }
    const loc = a.location;
    if (loc.queryName !== "") { // not the main object, don't recursively load data
        return null;
    }
    const queries = getRelatedQueries(item, state.contextCache, loc.path);
    if (queries && queries.length > 0) {
        dispatch(ActionFactory.startQueries(queries));
        queries.forEach( (q2) => {
            if (q2.query.objectId) {
                loadDetail(dispatch, client, q2);
            } else {
                loadList(dispatch, client, q2);
            }
        });
    }
    return null;
};

const eventsQuery = (item: IResource, ctx: ContextCache, parentPath: string): IQueryWithLocation => {
    const involved = [
        "involvedObject.name=" + item.metadata.name,
        "involvedObject.kind=" + item.kind,
    ];
    if (item.metadata.namespace) {
        involved.push("involvedObject.namespace=" + item.metadata.namespace);
    }
    const qry: ResourceQuery = {
        k8sContext: ctx.contextName,
        namespace: item.metadata.namespace,
        params: { "k8s.fieldSelector": involved.join(",") },
        resourceType: StandardResourceTypes.EVENT,
    };
    return { location: { path: parentPath, queryName: "events" }, query: qry };
};

interface ILabelSelectorQuery {
    resourceName: string;
    labelSelector: string;
    queryName: string;
}

const lsQuery = (item: IResource, lsq: ILabelSelectorQuery, ctx: ContextCache,
                 parentPath: string): IQueryWithLocation => {
    const qry: ResourceQuery = {
        k8sContext: ctx.contextName,
        namespace: item.metadata.namespace,
        params: { "k8s.labelSelector": lsq.labelSelector },
        resourceType: lsq.resourceName,
    };
    return { location: { path: parentPath, queryName: lsq.queryName }, query: qry };
};

const getRelatedQueries = (item: IResource, ctx: ContextCache, parentPath: string): IQueryWithLocation[] => {
    const rv = versionlessResourceType(item.apiVersion + ":" + item.kind);
    const pv = ctx.detail.preferredVersions[rv];
    const ret = [];
    if (!pv) {
        return ret;
    }
    let addEvents = false;
    switch (rv) {
        case StandardResourceTypes.DAEMONSET:
            addEvents = true;
            break;
        case StandardResourceTypes.REPLICA_SET:
            addEvents = true;
            ret.push(lsQuery(item, {
                labelSelector: toSelectorString(item.spec.selector),
                queryName: "pods",
                resourceName: StandardResourceTypes.POD,
            }, ctx, parentPath));
            break;
        case StandardResourceTypes.DEPLOYMENT:
            addEvents = true;
            break;
        case StandardResourceTypes.POD:
            addEvents = true;
            break;
        case StandardResourceTypes.SERVICE:
            addEvents = true;
            break;
        case StandardResourceTypes.STATEFUL_SET:
            addEvents = true;
            break;
    }
    if (addEvents) {
        ret.push(eventsQuery(item, ctx, parentPath));
    }
    return ret;
};
