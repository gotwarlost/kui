import {Client} from "../../client";
import {ActionTypes} from "../actions";

export const setScrollPosition = (client: Client) => ({dispatch, getState}) => (next) => (action) => {
    next(action);
    switch (action.type) {
        case ActionTypes.UI_SELECT_LIST_PAGE:
        case ActionTypes.UI_SELECT_OBJECT:
            window.scrollTo(0, 0);
    }
    return null;
};
