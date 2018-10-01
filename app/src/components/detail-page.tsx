import * as React from "react";
import {connect} from "react-redux";
import {Grid} from "semantic-ui-react";
import {State, StateReader} from "../model/state";
import {ObjectSelection} from "../model/types";
import {Breadcrumb} from "./breadcrumb";
import {detailFor} from "./k8s-resources/detail";
import {LeftNav} from "./left-nav";

export interface IDetailPage {
    selection: ObjectSelection;
}

export class DetailPageUI extends React.Component<IDetailPage, {}> {
    public render() {
        if (!this.props.selection) {
            return null;
        }
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={3}>
                        <LeftNav/>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        <Breadcrumb/>
                        {detailFor(this.props.selection.resourceName)}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export const DetailPage = connect(
    (s: State): IDetailPage => {
        return {selection: StateReader.getObjectSelection(s)};
    },
    (dispatch): {} => {
        return {};
    },
)(DetailPageUI);
