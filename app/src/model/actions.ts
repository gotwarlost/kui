import {Action} from "redux";
import {
    ContextCache,
    IQueryWithLocation,
    IResultsPath,
    NamespaceListCache,
    NamespaceSelection,
    ObjectSelection,
    ResourceQueryResults,
} from "./types";

export enum ActionTypes {
    UI_SELECT_CONTEXT = "select context",
    UI_SELECT_NAMESPACE = "select namespace",
    UI_SELECT_LIST_PAGE = "select list page",
    UI_SELECT_OBJECT = "select object",

    // data events, namespaces are treated specially since
    // they drive processing.
    START_CONTEXT_LOAD = "start context load",
    GET_CONTEXT_DETAIL = "get context detail",
    GET_NAMESPACE_LIST = "get namespace list",
    START_QUERIES = "start data load",
    DATA_RESULT = "load results",
    CLEAR_CACHE= "clear cache",

    // from react router redux, cannot use exported value in enum
    LOCATION_CHANGED = "@@router/LOCATION_CHANGE",

    // sentinel
    OTHER = "__not_used_sentinel_only__",
}

// sent when the user changes the current context.
export interface ISelectContext extends Action {
    type: ActionTypes.UI_SELECT_CONTEXT;
    context: string;
}

// sent when the user changes the namespace selection.
export interface ISelectNamespace extends Action {
    type: ActionTypes.UI_SELECT_NAMESPACE;
    namespace: NamespaceSelection;
}

export interface ISelectListPage extends Action {
    type: ActionTypes.UI_SELECT_LIST_PAGE;
    title: string;
    resourceTypes: string[];
}

export interface ISelectObject extends Action {
    type: ActionTypes.UI_SELECT_OBJECT;
    selection: ObjectSelection;
}

export interface IStartContextLoad extends Action {
    type: ActionTypes.START_CONTEXT_LOAD;
    cc: ContextCache;
    nl: NamespaceListCache;
}

export interface IGetContextDetail extends Action {
    type: ActionTypes.GET_CONTEXT_DETAIL;
    cc: ContextCache;
}

// sent when loading a namespace list.
export interface IListNamespaces extends Action {
    type: ActionTypes.GET_NAMESPACE_LIST;
    nl: NamespaceListCache;
}

// sent when loading other data.
export interface IStartQueries extends Action {
    type: ActionTypes.START_QUERIES;
    queries: IQueryWithLocation[];
}

// sent when loading results.
export interface IDataResult extends Action {
    type: ActionTypes.DATA_RESULT;
    location: IResultsPath;
    qr: ResourceQueryResults;
}

export interface IClearCache extends Action {
    type: ActionTypes.CLEAR_CACHE;
}

export interface ILocationChange extends Action {
    type: ActionTypes.LOCATION_CHANGED;
    payload: any;
}

// IOtherMessage is a sentinel message that is never used.
export interface IOtherMessage extends Action {
    type: ActionTypes.OTHER;
}

// union type of all supported actions.
export type AppAction =
    | ISelectContext
    | ISelectNamespace
    | ISelectListPage
    | ISelectObject
    | IStartContextLoad
    | IGetContextDetail
    | IListNamespaces
    | IStartQueries
    | IDataResult
    | IClearCache
    | ILocationChange
    | IOtherMessage;

// produces typed messages for every event.
export class ActionFactory {
    public static selectContext(context: string): ISelectContext {
        return {context, type: ActionTypes.UI_SELECT_CONTEXT};
    }

    public static selectNamespace(namespace: NamespaceSelection): ISelectNamespace {
        return {namespace, type: ActionTypes.UI_SELECT_NAMESPACE};
    }

    public static selectListPage(title: string, resourceTypes: string[]): ISelectListPage {
        return {resourceTypes, title, type: ActionTypes.UI_SELECT_LIST_PAGE};
    }

    public static selectObject(resourceType: string, namespace: string, name: string): ISelectObject {
        return {selection: {name, namespace, resourceType}, type: ActionTypes.UI_SELECT_OBJECT};
    }

    public static startContextLoad(cc: ContextCache, nl: NamespaceListCache): IStartContextLoad {
        return {cc, nl, type: ActionTypes.START_CONTEXT_LOAD};
    }

    public static getContextDetail(cc: ContextCache): IGetContextDetail {
        return {cc, type: ActionTypes.GET_CONTEXT_DETAIL};
    }

    public static getNamespaceList(nl: NamespaceListCache): IListNamespaces {
        return {nl, type: ActionTypes.GET_NAMESPACE_LIST};
    }

    public static startQueries(queries: IQueryWithLocation[]): IStartQueries {
        return {queries, type: ActionTypes.START_QUERIES};
    }

    public static dataResult(qr: ResourceQueryResults, cachePath: IResultsPath): IDataResult {
        return {location: cachePath, qr, type: ActionTypes.DATA_RESULT};
    }

    public static clearCache(): IClearCache {
        return { type: ActionTypes.CLEAR_CACHE};
    }
}
