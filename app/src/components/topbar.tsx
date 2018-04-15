import * as React from "react";
import {connect} from "react-redux";
import {Label} from "semantic-ui-react";
import {State} from "../model/state";
import {ContextList} from "./context-list";
import {NamespaceList} from "./namespace-list";

interface ITopBarProps {
    location: object;
}

class TopBarUI extends React.Component<ITopBarProps, {}> {
    public render() {
        return (
            <React.Fragment>
                <div className="navbar">
                    <Label pointing="right" content="Context"/>
                    <ContextList/>
                    <NamespaceList/>
                </div>
            </React.Fragment>
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
