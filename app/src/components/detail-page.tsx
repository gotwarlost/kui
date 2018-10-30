import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {renderDetail} from "./k8s-resources/detail";
import {IDetail} from "./k8s-resources/detail/detail-ui";
import {ErrorBoundary} from "./error-boundary";
import {ResourceQueryResults} from "../model/types";

interface IDetailPlus extends IDetail {
    resourceType: string;
    relatedQueryResults(name: string): ResourceQueryResults;
}

export class DetailPageUI extends React.Component<IDetailPlus, {}> {
    public render() {
        if (!this.props.qr) {
            return null;
        }
        return (
            <ErrorBoundary>
                <React.Fragment>
                    {renderDetail(this.props.resourceType, this.props)}
                </React.Fragment>
            </ErrorBoundary>
        );
    }
}

export const DetailPage = connect(
    (s: State): IDetailPlus => {
        const selection = StateReader.getObjectSelection(s);
        const resourceType = selection && selection.resourceType;
        const detailQueryPath = StateReader.detailQueryKey(s);
        const qr = StateReader.getResults(s, { path: detailQueryPath });
        const relatedQueryResults = (name: string): ResourceQueryResults => {
            return StateReader.getResults(s, { path: detailQueryPath, queryName: name });
        };
        const events = relatedQueryResults("events");
        return {
            events,
            kind: resourceType,
            qr,
            relatedQueryResults,
            resourceType,
        };
    },
    (dispatch) => {
        return {};
    },
)(DetailPageUI);
