import {routerReducer} from "react-router-redux";
import * as types from "./types";
import {NamespaceSelection, ResourceQueryResults} from "./types";

// IQueryResultsMap is a cache of query results, keyed by resource
// query string.
interface IQueryResultsMap {
    [key: string]: ResourceQueryResults;
}

// resourceQueryKey returns the string representation of the
// query, typically used as a cache key.
export function resourceQueryKey(q: types.ResourceQuery): string {
    const path = [q.k8sContext, q.resourceType];
    if (q.namespace) {
        path.push(q.namespace);
    }
    if (q.objectId) {
        path.push(q.objectId);
    }
    return path.join("/");
}

export class State {
    public availableContexts: string[];
    public contextCache?: types.ContextCache;
    public namespaceCache?: types.NamespaceListCache;
    public data: IQueryResultsMap;
    public routing: any;
    public selection: types.Selection;
}

export class StateReader {
    public static isContextSelected(state: State): boolean {
        const sel = state.selection;
        return !!sel.context && sel.context !== "";
    }

    public static isNamespaceSelected(state: State): boolean {
        const sel = state.selection;
        if (!(sel.context && sel.namespace)) {
            return false;
        }
        if (sel.namespace.scope === types.QueryScope.SINGLE_NAMESPACE) {
            return sel.namespace.namespace !== "";
        }
        return true;
    }

    public static hasResourceInfo(state: State): boolean {
        return !!(state.contextCache &&
            state.contextCache.detail &&
            state.selection.context === state.contextCache.contextName);
    }

    public static getResources(state: State, scope: types.QueryScope): types.IResourceInfo[] {
        if (!StateReader.hasResourceInfo(state)) {
            return null;
        }
        const resources = state.contextCache.detail.resources;
        const out = [];
        const needCluster = scope === types.QueryScope.CLUSTER_OBJECTS;
        for (const res of resources) {
            if (res.isClusterResource === needCluster) {
                out.push(res);
            }
        }
        return out;
    }

    public static getResourceInfo(state: State, id: string): types.IResourceInfo {
        if (!StateReader.hasResourceInfo(state)) {
            return null;
        }
        const resources = state.contextCache.detail.resources;
        for (const res of resources) {
            if (res.id === id) {
                return res;
            }
        }
        return null;
    }

    public static getListPageSelection(state: State): types.ListPageSelection {
        if (!StateReader.isNamespaceSelected(state)) {
            return null;
        }
        if (!StateReader.hasResourceInfo(state)) {
            return null;
        }
        if (state.selection.list) {
            return state.selection.list;
        }
        return {
            resourceTypes: StateReader.getResources(state, state.selection.namespace.scope).map((item) => item.id),
            title: overviewTitle,
        };
    }

    public static getObjectSelection(state: State): types.ObjectSelection {
        if (!StateReader.hasResourceInfo(state)) {
            return null;
        }
        if (state.selection.object) {
            return state.selection.object;
        }
        return null;
    }

    public static listQueryKey(s: State, resourceType: string) {
        const sel = s.selection;
        const ns = sel.namespace;
        const info = StateReader.getResourceInfo(s, resourceType) || {isClusterResource: false};
        return resourceQueryKey({
            k8sContext: sel.context,
            namespace: !info.isClusterResource && ns.scope === types.QueryScope.SINGLE_NAMESPACE ? ns.namespace : "",
            resourceType,
        });
    }

    public static detailQueryKey(s: State) {
        const obj = StateReader.getObjectSelection(s) || {namespace: "", name: "", resourceType: ""};
        return resourceQueryKey({
            k8sContext: s.selection.context,
            namespace: obj.namespace,
            objectId: obj.name,
            resourceType: obj.resourceType,
        });
    }
}

export const overviewTitle = "Overview";

export function initialState(ctxList: string[]): State {
    return {
        availableContexts: ctxList,
        data: {},
        routing: routerReducer(undefined, undefined),
        selection: {},
    };
}
