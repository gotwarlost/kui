import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {QueryScope} from "../model/types";
import {renderList} from "./k8s-resources/list";
import {collectionName} from "../util";

export interface IListPageProps {
    state: State;
}

interface IListPage extends IListPageProps {

}

export class ListPageUI extends React.Component<IListPage, {}> {
    public render() {
        const state = this.props.state;
        const sel = StateReader.getListPageSelection(state);
        if (!sel) {
            return null;
        }
        const op = sel.resourceTypes;
        const showWhenNoResults = sel.resourceTypes.length === 1;
        const pageSize = sel.resourceTypes.length === 1 ? 15 : 15; // need to fix bugs when different
        const pages = op.map((resourceType) => {
            const ns = state.selection.namespace;
            const key = StateReader.listQueryKey(state, resourceType);
            const qr = StateReader.getResults(state, { path: key });
            return renderList(resourceType, {
                displayNamespace: ns.scope === QueryScope.ALL_NAMESPACES,
                listName: collectionName(StateReader.getResourceInfo(state, resourceType)),
                pageSize,
                qr,
                showWhenNoResults,
            });
        });
        return (
            <React.Fragment>
                {pages}
            </React.Fragment>
        );
    }
}

export const ListPage = connect(
    (s: State): IListPage => ({ state: s }),
    (dispatch) => {
        return {};
    },
)(ListPageUI);
