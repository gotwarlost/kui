import {routerReducer} from "react-router-redux";
import {ActionTypes, AppAction} from "../actions";
import {path2Selection} from "../pathmap";
import {State} from "../state";

const shallowCopy = (x) => {
    const copy = {};
    Object.keys(x || {}).forEach((k) => { copy[k] = x[k]; });
    return copy;
};

export function rootReducer(old: State, action: AppAction): State {
    switch (action.type) {
        case ActionTypes.LOCATION_CHANGED:
            const newRouting = routerReducer(old.routing, action);
            const loc = newRouting.location;
            return {
                ...old,
                routing: newRouting,
                selection: path2Selection(loc),
            };
        case ActionTypes.START_CONTEXT_LOAD:
            return {
                ...old,
                contextCache: action.cc,
                namespaceCache: action.nl,
            };
        case ActionTypes.GET_CONTEXT_DETAIL:
            return {
                ...old,
                contextCache: action.cc,
            };
        case ActionTypes.GET_NAMESPACE_LIST:
            return {
                ...old,
                namespaceCache: action.nl,
            };
        case ActionTypes.START_QUERIES:
            const qd = shallowCopy(old.data);
            action.queries.forEach( (ql) => {
                qd[ql.location.path] = qd[ql.location.path] || {};
                qd[ql.location.path][ql.location.queryName || ""] = {
                    loading: true,
                    query: ql.query,
                };
            });
            return {
                ...old,
                data: qd,
            };
        case ActionTypes.DATA_RESULT:
            const qd2 = shallowCopy(old.data);
            qd2[action.location.path] = qd2[action.location.path] || {};
            qd2[action.location.path][action.location.queryName || ""] = action.qr;
            return {
                ...old,
                data: qd2,
            };
        case ActionTypes.CLEAR_CACHE:
            return {
                ...old,
                data: {},
            };
        default:
            return old;
    }
}
