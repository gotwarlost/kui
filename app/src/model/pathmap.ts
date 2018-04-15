import {LocationDescriptorObject} from "history";
import * as qs from "querystring";
import {Selection} from "./types";
import {NamespaceSelection, QueryScope} from "./types";

const ROOT_PATH = "/";
const UI_PATH = "/ui";
const LIST_TITLE_PARAM = "lt";
const LIST_RESOURCE_PARAM = "lr";
const OBJECT_RESOURCE_PARAM = "or";
const OBJECT_NAMESPACE_PARAM = "ons";
const OBJECT_NAME_PARAM = "on";

const singularParam = (v: string|string[]): string => {
    if (!v) {
        return "";
    }
    if (Array.isArray(v)) {
        return (v as string[])[0];
    }
    return (v as string);
};

export const path2Selection = (loc: LocationDescriptorObject): Selection => {
    const sel: Selection = {};
    let p = loc.pathname;
    if (!p) {
        return sel;
    }
    const pos = p.indexOf(UI_PATH + "/");
    if (pos !== 0) {
        return sel;
    }
    p = p.substring(UI_PATH.length + 1);
    const parts = p.split("/");
    sel.context = parts[0];
    let nsSel: NamespaceSelection = {scope: QueryScope.SINGLE_NAMESPACE, namespace: ""};
    if (parts.length > 1) {
        const nsPath = parts[1];
        if (nsPath === "cluster") {
            nsSel.scope = QueryScope.CLUSTER_OBJECTS;
        } else if (nsPath === "all") {
            nsSel.scope = QueryScope.ALL_NAMESPACES;
        } else {
            const leading = "ns,";
            const nsPos = nsPath.indexOf(leading);
            if (nsPos === 0) {
                nsSel.namespace = nsPath.substring(leading.length);
            } else {
                nsSel = null;
            }
        }
        sel.namespace = nsSel;
    }
    if (!sel.namespace) {
        return sel;
    }
    if (loc.search) {
        let s = loc.search as string;
        if (s.indexOf("?") === 0) {
            s = s.substring(1);
        }
        const query = qs.parse(s);
        const lr = query[LIST_RESOURCE_PARAM];
        if (lr) {
            sel.list = {
                resources: Array.isArray(lr) ? lr : [lr],
                title: query[LIST_TITLE_PARAM].toString() || "",
            };
        }
        const or = query[OBJECT_RESOURCE_PARAM];
        const on = query[OBJECT_NAME_PARAM];
        if (or && on) {
            sel.object = {
                name: singularParam(on),
                namespace: singularParam(query[OBJECT_NAMESPACE_PARAM]),
                resourceName: singularParam(or),
            };
        }
    }
    return sel;
};

export const selection2Path = (sel: Selection): LocationDescriptorObject => {
    if (!sel.context) {
        return {pathname: ROOT_PATH};
    }
    let ret = UI_PATH + "/" + sel.context;
    if (sel.namespace) {
        const ns = sel.namespace;
        if (ns.scope === QueryScope.CLUSTER_OBJECTS) {
            ret += "/cluster";
        } else if (ns.scope === QueryScope.ALL_NAMESPACES) {
            ret += "/all";
        } else if (ns.namespace) {
            ret += "/ns," + ns.namespace;
        }
    }
    const query = {};
    if (sel.list) {
        query[LIST_RESOURCE_PARAM] = sel.list.resources;
        query[LIST_TITLE_PARAM] = sel.list.title || "";
    }
    if (sel.object) {
        query[OBJECT_RESOURCE_PARAM] = sel.object.resourceName;
        query[OBJECT_NAMESPACE_PARAM] = sel.object.namespace;
        query[OBJECT_NAME_PARAM] = sel.object.name;
    }
    return {pathname: ret, search: qs.stringify(query)};
};
