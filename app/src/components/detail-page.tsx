import * as React from "react";
import {connect} from "react-redux";
import {State, StateReader} from "../model/state";
import {renderDetail} from "./k8s-resources/detail";
import {IDetailProps, IDetailDispatch, IDetail} from "./k8s-resources/detail/detail-ui";
import {ErrorBoundary} from "./error-boundary";
import {ActionFactory} from "../model/actions";

interface IDetailPlus extends IDetailProps {
    resourceType: string;
}

export class DetailPageUI extends React.Component<IDetailPlus & IDetailDispatch, {}> {
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
        const key = StateReader.detailQueryKey(s);
        const qr = StateReader.getResults(s, { path: key });
        const events = StateReader.getResults(s, { path: key, queryName: "events" });
        return {
            events,
            kind: resourceType,
            qr,
            resourceType,
        };
    },
    (dispatch): IDetailDispatch => {
        return {
            onSelect: (evt, data) => {
                return dispatch(ActionFactory.selectObject(data.resourceName, data.namespace, data.objectID));
            },
        };
    },
)(DetailPageUI);
