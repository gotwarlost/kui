import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {ObjectSelection} from "../model/types";
import {detailFor} from "./k8s-resources/detail";

export interface IDetailPage {
    selection: ObjectSelection;
}

export class DetailPageUI extends React.Component<IDetailPage, {}> {
    public render() {
        if (!this.props.selection) {
            return null;
        }
        return (
            <React.Fragment>
                {detailFor(this.props.selection.resourceName)}
            </React.Fragment>
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
