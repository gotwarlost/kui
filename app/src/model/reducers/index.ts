import {routerReducer} from "react-router-redux";
import {ActionTypes, AppAction} from "../actions";
import {path2Selection} from "../pathmap";
import {resourceQueryKey, State} from "../state";

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
        case ActionTypes.LOAD_DATA:
            const qd = old.data || {};
            qd[resourceQueryKey(action.qr.query)] = action.qr;
            return {
                ...old,
                data: qd,
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
