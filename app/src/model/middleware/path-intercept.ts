import * as deepEqual from "deep-equal";
import {push} from "react-router-redux";
import {Client} from "../../client";
import {ActionFactory, ActionTypes} from "../actions";
import {selection2Path} from "../pathmap";
import {State} from "../state";
import {QueryScope, Selection} from "../types";

const navigateTo = (dispatch: any, sel: Selection) => {
    return dispatch(push(selection2Path(sel)));
};

export const pathIntercept = (client: Client) => ({dispatch, getState}) => (next) => (action) => {
    next(action);
    const state = getState() as State;
    switch (action.type) {
        case ActionTypes.UI_SELECT_CONTEXT:
            return navigateTo(dispatch, {
                context: action.context,
                namespace: {
                    namespace: "",
                    scope: QueryScope.SINGLE_NAMESPACE,
                },
            });

        case ActionTypes.UI_SELECT_NAMESPACE:
            return navigateTo(dispatch, {
                context: state.selection.context,
                namespace: action.namespace,
            });

        case ActionTypes.UI_SELECT_LIST_PAGE:
            return navigateTo(dispatch, {
                context: state.selection.context,
                list: {
                    resources: action.resources,
                    title: action.title,
                },
                namespace: state.selection.namespace,
            });

        case ActionTypes.UI_SELECT_OBJECT:
        return navigateTo(dispatch, {
                context: state.selection.context,
                list: state.selection.list,
                namespace: state.selection.namespace,
                object: {
                    name: action.selection.name,
                    namespace: action.selection.namespace,
                    resourceName: action.selection.resourceName,
                },
            });
        }
};
