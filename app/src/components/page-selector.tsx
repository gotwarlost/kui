import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {DetailPage} from "./detail-page";
import {ListPage} from "./list-page";

export interface IPageSelector {
    selectionPresent: boolean;
    objectSelected: boolean;
}

export class PageSelectorUI extends React.Component<IPageSelector, {}> {
    public render() {
        if (this.props.objectSelected) {
            return <DetailPage/>;
        }
        if (this.props.selectionPresent) {
            return <ListPage/>;
        }
        return <div>Please select a context and/ or namespace</div>;
    }
}

export const PageSelector = connect(
    (s: State): IPageSelector => {
        return {
            objectSelected: !!StateReader.getObjectSelection(s),
            selectionPresent: !!StateReader.getListPageSelection(s),
        };
    },
    (dispatch): {} => {
        return {};
    },
)(PageSelectorUI);
