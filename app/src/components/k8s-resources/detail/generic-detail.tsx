import * as React from "react";
import { connect } from "react-redux";
import { State, StateReader } from "../../../model/state";
import {DetailUI, IContentProvider, IDetailDispatch, IDetailProps} from "./detail-ui";

interface nameProps {
    name: string
}

export const genericDetailForResource = (provider: IContentProvider = null) => connect(
    (s: State, props: nameProps): IDetailProps => {
        const name = props.name;
        const qd = s.data || {};
        const key = StateReader.detailQueryKey(s);
        return {
            kind: name,
            provider,
            qr: qd[key],
        };
    },
    (dispatch): IDetailDispatch => {
        return {
            onBack: null,
        };
    },
)(DetailUI);

const stdDetail = genericDetailForResource();

export const createDetailElement = (props, state = null): React.ReactNode => {
    return React.createElement(stdDetail, props, state);
};
