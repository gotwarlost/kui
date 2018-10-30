import * as deepEqual from "deep-equal";
import {Client} from "../../client";
import {ActionFactory, ActionTypes} from "../actions";
import {State, StateReader} from "../state";
import {IQueryWithLocation, IResultsPath, ResourceQuery} from "../types";

export const loadList = (dispatch: any, client: Client, queryLoc: IQueryWithLocation) => {
    const q = queryLoc.query;
    client.listResources(q.k8sContext, q.resourceType, q.namespace, queryLoc.query.params, (err, results) => {
        dispatch(ActionFactory.dataResult({
            err,
            query: q,
            results,
        }, queryLoc.location));
    });
};

export const loadDetail = (dispatch: any, client: Client, queryLoc: IQueryWithLocation) => {
    const q = queryLoc.query;
    client.getResource(q.k8sContext, q.resourceType, q.namespace, q.objectId, queryLoc.query.params, (err, results) => {
        dispatch(ActionFactory.dataResult({
            err,
            query: q,
            results,
        }, queryLoc.location));
    });
};

export const stateWatch = (client: Client) => ({dispatch, getState}) => (next) => (action) => {
    const old = getState() as State;
    next(action);
    const state = getState() as State;
    const sel = state.selection;

    const oldns = old.selection.namespace || {scope: null, namespace: null};
    const oldp = {c: old.selection.context, s: oldns.scope, n: oldns.namespace};
    const newns = state.selection.namespace || {scope: null, namespace: null};
    const newp = {c: state.selection.context, s: newns.scope, n: newns.namespace};

    if (!deepEqual(oldp, newp)) {
        dispatch(ActionFactory.clearCache());
        return;
    }

    if (!(sel && sel.context)) {
        return;
    }

    // check context cache and namespace list as a tied operation
    if (!(state.contextCache && state.contextCache.contextName === sel.context)) {
        const cc = {
            contextName: sel.context,
            loading: true,
        };
        const nl = {
            contextName: sel.context,
            loading: true,
        };
        dispatch(ActionFactory.startContextLoad(cc, nl));
        client.getContext(sel.context, (err, detail) => {
            dispatch(ActionFactory.getContextDetail({
                contextName: sel.context,
                detail,
                err,
            }));
        });
        client.listResources(sel.context, "v1:Namespace", "", null, (err, list) => {
            let namespaces = null;
            if (!err && list.items) {
                namespaces = list.items.map((item) => item.metadata.name);
            }
            dispatch(ActionFactory.getNamespaceList({
                contextName: sel.context,
                err,
                namespaces,
            }));
        });
        return;
    }

    if ((state.contextCache && state.contextCache.loading) || (state.namespaceCache && state.namespaceCache.loading)) {
        return;
    }

    // if list selection is present, ensure data is loaded
    const ls = StateReader.getListPageSelection(state);
    if (ls) {
        const queries: IQueryWithLocation[] = [];
        ls.resourceTypes.forEach((resourceType) => {
            const location: IResultsPath = { path: StateReader.listQueryKey(state, resourceType), queryName: ""};
            if (!StateReader.hasResults(state, location)) {
                const query: ResourceQuery = {
                    k8sContext: state.selection.context,
                    namespace: state.selection.namespace.namespace,
                    resourceType,
                };
                queries.push({
                    location,
                    query,
                });
            }
        });
        if (queries.length > 0) {
            dispatch(ActionFactory.startQueries(queries));
            queries.forEach((query) => {
                loadList(dispatch, client, query);
            });
            return null;
        }
    }

    // if object selection is present, ensure data is loaded
    const os = StateReader.getObjectSelection(state);
    if (os) {
        const location: IResultsPath = { path: StateReader.detailQueryKey(state), queryName: ""};
        const query: ResourceQuery = {
            k8sContext: state.selection.context,
            namespace: os.namespace,
            objectId: os.name,
            resourceType: os.resourceType,
        };
        if (!StateReader.hasResults(state, location)) {
            const ql = {location, query};
            const queries = [ ql ];
            dispatch(ActionFactory.startQueries(queries));
            queries.forEach( (q1) => {
                loadDetail(dispatch, client, q1);
            });
        }
    }
    return null;
};
