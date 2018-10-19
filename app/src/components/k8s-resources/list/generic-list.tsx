import * as React from "react";
import {connect} from "react-redux";
import {ActionFactory} from "../../../model/actions";
import {State, StateReader} from "../../../model/state";
import {QueryScope} from "../../../model/types";
import {IBaseAccessors, IListDispatch, IListProps, IReactTableColumn, ListUI} from "./list-ui";

interface nameProps {
    name: string
    key?: string
}

export const genericListForResource = (cols: IReactTableColumn[] = null,
                                       baseAccessors: IBaseAccessors = null) => connect(
    (s: State, props: nameProps): IListProps => {
        const name = props.name;
        const ns = s.selection.namespace;
        const qd = s.data || {};
        const key = StateReader.listQueryKey(s, name);
        const qr = qd[key];
        return {
            baseAccessors,
            cols,
            displayNamespace: ns.scope === QueryScope.ALL_NAMESPACES,
            listName: StateReader.getResourceInfo(s, name).pluralName,
            qr,
        };
    },
    (dispatch): IListDispatch => {
        return {
            onSelect: (evt, data) => {
                return dispatch(ActionFactory.selectObject(data.resourceName, data.namespace, data.objectID));
            },
        };
    },
)(ListUI);

const stdList = genericListForResource();

export const createListElement = (props, state = null): React.ReactNode => {
    return React.createElement(stdList, props, state);
};
