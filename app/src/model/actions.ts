import {Action} from "redux";
import {
    ContextCache,
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
    GET_CONTEXT_DETAIL = "get context detail",
    GET_NAMESPACE_LIST = "get namespace list",
    LOAD_DATA = "load data",
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
    resources: string[];
}

export interface ISelectObject extends Action {
    type: ActionTypes.UI_SELECT_OBJECT;
    selection: ObjectSelection;
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
export interface ILoadData extends Action {
    type: ActionTypes.LOAD_DATA;
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
    | IGetContextDetail
    | IListNamespaces
    | ILoadData
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

    public static selectListPage(title: string, resources: string[]): ISelectListPage {
        return {resources, title, type: ActionTypes.UI_SELECT_LIST_PAGE};
    }

    public static selectObject(resourceName: string, namespace: string, name: string): ISelectObject {
        return {selection: {name, namespace, resourceName}, type: ActionTypes.UI_SELECT_OBJECT};
    }

    public static getContextDetail(cc: ContextCache): IGetContextDetail {
        return {cc, type: ActionTypes.GET_CONTEXT_DETAIL};
    }

    public static getNamespaceList(nl: NamespaceListCache): IListNamespaces {
        return {nl, type: ActionTypes.GET_NAMESPACE_LIST};
    }

    public static loadData(qr: ResourceQueryResults): ILoadData {
        return {qr, type: ActionTypes.LOAD_DATA};
    }

    public static clearCache(): IClearCache {
        return { type: ActionTypes.CLEAR_CACHE};
    }
}
