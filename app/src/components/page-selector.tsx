import * as React from "react";
import {Grid} from "semantic-ui-react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {DetailPage} from "./detail-page";
import {ListPage} from "./list-page";
import {LeftNav} from "./left-nav";
import {Breadcrumb} from "./breadcrumb";
import {ErrorBoundary} from "./error-boundary";

export interface IPageSelector {
    selectionPresent: boolean;
    objectSelected: boolean;
}

export class PageSelectorUI extends React.Component<IPageSelector, {}> {
    public render() {
        const renderDetail = this.props.objectSelected;
        const renderList =  this.props.selectionPresent;
        const listStyle = { display: renderDetail ? "none" : ""};
        const detail = renderDetail ? <DetailPage/> : null;
        if (!renderList) {
            return <div>Please select a context and/ or namespace</div>;
        }

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={3}>
                        <ErrorBoundary>
                            <React.Fragment>
                                <LeftNav/>
                            </React.Fragment>
                        </ErrorBoundary>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        <Breadcrumb/>
                        <div key="list" style={listStyle}>
                            <ListPage />
                        </div>
                        <div key="detail">
                            {detail}
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
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
