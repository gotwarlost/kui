import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {ListPageSelection} from "../model/types";
import {listFor} from "./k8s-resources/list/index";

export interface IListPage {
    selection: ListPageSelection;
}

export class ListPageUI extends React.Component<IListPage, {}> {
    public render() {
        if (!this.props.selection) {
            return null;
        }
        const op = this.props.selection.resourceTypes;
        const showWhenNoResults = this.props.selection.resourceTypes.length === 1;
        const pageSize = this.props.selection.resourceTypes.length === 1 ? 15 : 15; // need to fix bugs when different
        const pages = op.map((name) => listFor(name, showWhenNoResults, pageSize));
        return (
            <React.Fragment>
                {pages}
            </React.Fragment>
        );
    }
}

export const ListPage = connect(
    (s: State): IListPage => {
        return {
            selection: StateReader.getListPageSelection(s),
        };
    },
    (dispatch): {} => {
        return {};
    },
)(ListPageUI);
