import * as React from "react";
import {connect} from "react-redux";
import {Label, Segment} from "semantic-ui-react";
import {State} from "../model/state";
import {ContextList} from "./context-list";
import {NamespaceList} from "./namespace-list";

interface ITopBarProps {
    location: object;
}

class TopBarUI extends React.Component<ITopBarProps, {}> {
    public render() {
        return (
            <Segment>
                <Label pointing="right" content="Context"/>
                <ContextList/>
                <NamespaceList/>
            </Segment>
        );
    }
}

export const TopBar = connect(
    (s: State, props: any): ITopBarProps => {
        return {
            location: props.location,
        };
    },
    (dispatch): {} => {
        return {};
    },
)(TopBarUI);
