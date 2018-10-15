import * as React from "react";
import {InlineObject} from "./inline-object";

export const formatResources = (res): React.ReactNode => {
    const lines = [];
    lines.push(res.requests && (
        <React.Fragment>
            <i>Request</i>&nbsp;&nbsp;
            <InlineObject object={res.requests}/>
        </React.Fragment>
    ));
    lines.push(<br/>);
    lines.push(res.limits && (
        <React.Fragment>
            <i>Limit</i>&nbsp;&nbsp;
            <InlineObject object={res.limits}/>
        </React.Fragment>
    ));
    return <React.Fragment>{lines}</React.Fragment>;
};
