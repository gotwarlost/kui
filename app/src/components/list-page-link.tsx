import * as React from "react";
import {connect} from "react-redux";
import {Icon} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {State} from "../model/state";

export interface IListPageLinkProps {
    title: string;
    resources: string[];
    selected: boolean;
    count?: number;
    error?: boolean;
    loading?: boolean;
}

export interface IListPageLinkWrapperProps {
    title?: string;
    count?: number;
    loading?: boolean;
    error?: boolean;
    resources: string[];
    selectedTitle: string;
}

export interface IListPageLinkEvents {
    onClick(evt: any, IListPageLinkProps);
}

export interface IListPageLink extends IListPageLinkProps, IListPageLinkEvents {
}

class ListPageLinkUI extends React.Component<IListPageLink, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const title = this.props.title || "<unknown title>";
        return (
            <div className={this.props.selected ? "list-link list-link-selected" : "list-link"}>
                <a href="#" onClick={this.onClick}>
                    {title}
                    &nbsp;
                    {typeof(this.props.count) === "number" ? " (" + this.props.count + ")" : ""}
                    {this.props.loading && <Icon name="wait" className="grey"/>}
                    {this.props.error && <Icon name="warning sign" className="orange"/>}
                </a>
            </div>
        );
    }

    private onClick(evt: any) {
        return this.props.onClick(evt, this.props);
    }
}

export const ListPageLink = connect(
    (s: State, props: IListPageLinkWrapperProps): IListPageLinkProps => {
        const title = props.title || "<unknown title>";
        return {
            count: props.count,
            error: props.error,
            loading: props.loading,
            resources: props.resources,
            selected: title === props.selectedTitle,
            title,
        };
    },
    (dispatch): IListPageLinkEvents => {
        return {
            onClick: (evt, props) => {
                evt.preventDefault();
                dispatch(ActionFactory.selectListPage(props.title, props.resources));
            },
        };
    },
)(ListPageLinkUI);
