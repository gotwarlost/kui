import * as React from "react";
import {ActionFactory} from "../../../../model/actions";
import {connect} from "react-redux";

interface IObjectLinkProps {
    type: string;
    name: string;
    namespace: string;
}

interface IObjectLinkDispatch {
    onSelect(props: IObjectLinkProps);
}

interface IObjectLink extends IObjectLinkProps, IObjectLinkDispatch {
}

class ObjectLinkUI extends React.Component<IObjectLink, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        return <a href="#" onClick={this.onClick}>{this.props.children}</a>;
    }

    private onClick(e) {
        e.preventDefault();
        this.props.onSelect(this.props);
    }
}

export const ObjectLink = connect(
    (s: object, own: IObjectLinkProps): IObjectLinkProps => {
        return own;
    },
    (dispatch): IObjectLinkDispatch => {
        return {
            onSelect: (props) => {
                dispatch(ActionFactory.selectObject(props.type, props.namespace, props.name));
            },
        };
    },
)(ObjectLinkUI);
