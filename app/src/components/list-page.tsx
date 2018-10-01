import * as React from "react";
import {connect} from "react-redux";
import {Grid} from "semantic-ui-react";
import {State, StateReader} from "../model/state";
import {ListPageSelection} from "../model/types";
import {Breadcrumb} from "./breadcrumb";
import {listFor} from "./k8s-resources/list";
import {LeftNav} from "./left-nav";

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
            <Grid>
                <Grid.Row>
                    <Grid.Column width={3}>
                        <LeftNav/>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        <Breadcrumb/>
                        {...pages}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export const ListPage = connect(
    (s: State): IListPage => {
        return {selection: StateReader.getListPageSelection(s)};
    },
    (dispatch): {} => {
        return {};
    },
)(ListPageUI);
