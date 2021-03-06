import {routerReducer} from "react-router-redux";
import * as types from "./types";
import {IResultsPath, NamespaceSelection, ResourceQueryResults} from "./types";

// IQueryResultsMap is a cache of query results, keyed by resource
// query string.
interface IQueryResultsMap {
    [key: string]: ResourceQueryResults;
}

// resourceQueryKey returns the string representation of the
// query, typically used as a cache key.
const resourceQueryKey = (q: types.ResourceQuery): string => {
    const path = [q.k8sContext, q.resourceType];
    if (q.namespace) {
        path.push(q.namespace);
    }
    if (q.objectId) {
        path.push(q.objectId);
    }
    return path.join("/");
};

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

    public static getResources(state: State, scope: types.QueryScope): types.IResourceGroup[] {
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
        const groupMap = {};
        out.forEach( (info) => {
            if (!groupMap[info.displayGroup]) {
                groupMap[info.displayGroup] = [];
            }
            groupMap[info.displayGroup].push(info);
        });
        const keys = Object.keys(groupMap);
        const groups = [];
        keys.sort();
        keys.forEach( (key) => {
            const gtypes = groupMap[key];
            gtypes.sort( (a, b) => {
                if (a.displayName < b.displayName) {
                    return -1;
                }
                return 1;
            });
            groups.push({
                name: key,
                resources: gtypes,
            });
        });
        return groups;
    }

    public static getResourceInfo(state: State, id: string): types.IResourceInfo {
        if (!StateReader.hasResourceInfo(state)) {
            return null;
        }
        const parts = id.split(":");
        const rv = parts.length === 1 ? "" : parts[0];
        const kind = parts.length === 1 ? parts[0] : parts[1];
        const rparts = rv.split("/");
        const group = rparts.length === 1 ? "" : rparts[0];
        const base = group + "/:" + kind;

        const reg = state.contextCache.detail;
        const real = reg.aliases[base] || base;
        const preferredVersion = reg.preferredVersions[real];

        const resources = reg.resources;
        for (const res of resources) {
            if (res.id === preferredVersion) {
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
        const groups = StateReader.getResources(state, state.selection.namespace.scope);
        const gtypes = [];
        groups.forEach( (group) => {
            group.resources.forEach( (res) => {
                gtypes.push(res.id);
            });
        });
        return {
            resourceTypes: gtypes,
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

    public static getResults(s: State, location: IResultsPath): ResourceQueryResults {
        const scope = s.data[location.path];
        const qName = location.queryName || "";
        if (!scope) {
            return null;
        }
        const output = scope[qName];
        return output || null;
    }

    public static hasResults(s: State, location: IResultsPath): boolean {
        return StateReader.getResults(s, location) !== null;
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
