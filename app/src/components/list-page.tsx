import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {ListPageSelection} from "../model/types";
import {listFor} from "./k8s-resources/list";
import {ErrorBoundary} from "./error-boundary";

export interface IListPage {
    selection: ListPageSelection;
}

export class ListPageUI extends React.Component<IListPage, {}> {
    public render() {
        if (!this.props.selection) {
            return null;
        }
        const op = this.props.selection.resources;
        const pages = op.map((name) => listFor(name));
        return (
            <ErrorBoundary>
                <React.Fragment>
                    {pages}
                </React.Fragment>
            </ErrorBoundary>
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
