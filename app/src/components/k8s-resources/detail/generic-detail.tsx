import * as React from "react";
import { connect } from "react-redux";
import { State, StateReader } from "../../../model/state";
import {DetailUI, IContentProvider, IDetailDispatch, IDetailProps} from "./detail-ui";

export const genericDetailForResource = (name: string, provider: IContentProvider = null) => connect(
    (s: State): IDetailProps => {
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

export const createDetailElement = (name: string, props = {}, state = null): React.ReactNode => {
    return React.createElement(genericDetailForResource(name), props, state);
};
