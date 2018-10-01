import * as deepEqual from "deep-equal";
import {Client} from "../../client";
import {ActionFactory} from "../actions";
import {State, StateReader} from "../state";
import {ResourceQuery} from "../types";

const loadList = (dispatch: any, client: Client, q: ResourceQuery) => {
    dispatch(ActionFactory.loadData({
        loading: true,
        query: q,
    }));
    client.listResources(q.k8sContext, q.resourceName, q.namespace, (err, results) => {
        dispatch(ActionFactory.loadData({
            err,
            query: q,
            results,
        }));
    });
};

const loadDetail = (dispatch: any, client: Client, q: ResourceQuery) => {
    dispatch(ActionFactory.loadData({
        loading: true,
        query: q,
    }));
    client.getResource(q.k8sContext, q.resourceName, q.namespace, q.objectName, (err, results) => {
        dispatch(ActionFactory.loadData({
            err,
            query: q,
            results,
        }));
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
    }

    if (!(sel && sel.context)) {
        return;
    }

    // check context cache and namespace list as a tied operation
    if (!(state.contextCache && state.contextCache.contextName === sel.context)) {
        dispatch(ActionFactory.getContextDetail({
            contextName: sel.context,
            loading: true,
        }));
        client.getContext(sel.context, (err, detail) => {
            dispatch(ActionFactory.getContextDetail({
                contextName: sel.context,
                detail,
                err,
            }));
        });
        dispatch(ActionFactory.getNamespaceList({
            contextName: sel.context,
            loading: true,
        }));
        client.listResources(sel.context, "namespaces", "", (err, list) => {
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
    }

    // if list selection is present, ensured data is loaded
    const ls = StateReader.getListPageSelection(state);
    if (ls) {
        ls.resources.forEach((name) => {
            const lkey = StateReader.listQueryKey(state, name);
            if (!state.data[lkey]) {
                const q: ResourceQuery = {
                    k8sContext: state.selection.context,
                    namespace: state.selection.namespace.namespace,
                    resourceName: name,
                };
                loadList(dispatch, client, q);
            }
        });
    }

    // if objects selection is present, ensured data is loaded
    const os = StateReader.getObjectSelection(state);
    if (os) {
        const lkey = StateReader.detailQueryKey(state);
        if (!state.data[lkey]) {
            const q: ResourceQuery = {
                k8sContext: state.selection.context,
                namespace: os.namespace,
                objectName: os.name,
                resourceName: os.resourceName,
            };
            loadDetail(dispatch, client, q);
        }
    }
    return null;
};
