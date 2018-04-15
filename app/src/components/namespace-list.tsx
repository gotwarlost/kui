import * as React from "react";
import {connect} from "react-redux";
import {Checkbox, Label, Loader} from "semantic-ui-react";
import {Dropdown, Icon, Popup} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {State} from "../model/state";
import {IResourceList, NamespaceListCache, NamespaceSelection, QueryScope} from "../model/types";

interface IErrorIcon {
    prefix?: string;
    error?: string;
}

class ErrorIcon extends React.Component<IErrorIcon, {}> {
    public render() {
        if (!this.props.error) {
            return null;
        }
        const trigger = <Icon name="warning sign" size="large" className="orange"/>;
        const msg = <span>
            <i>{this.props.prefix}</i>
            {this.props.error}
        </span>;
        return (
            <Popup
                trigger={trigger}
                content={msg}
                wide="very"
            />
        );
    }
}

interface INamespaceListProps {
    sel: NamespaceSelection;
    items?: string[];
    disabled?: boolean;
    loading?: boolean;
    error?: string;
}

interface INamespaceListEvents {
    onSelect(sel: NamespaceSelection);
}

interface INamespaceList extends INamespaceListProps, INamespaceListEvents {
}

class NamespaceListUI extends React.Component<INamespaceList, {}> {
    constructor(props, state) {
        super(props, state);
        this.onSelectNamespace = this.onSelectNamespace.bind(this);
        this.onSelectRadio = this.onSelectRadio.bind(this);
    }

    public render() {
        const items = this.props.items || [];
        const listItems = items.map((name) => {
            return {key: name, text: name, value: name};
        });
        return (
            <div className="ns-list">
                <Label pointing="right" content="Namespace"/>
                <span className="padded-radio">
                    <Checkbox radio name="nsgroup"
                              disabled={this.props.disabled}
                              value={QueryScope.SINGLE_NAMESPACE}
                              checked={this.props.sel.scope === QueryScope.SINGLE_NAMESPACE}
                              onChange={this.onSelectRadio}
                    />
                </span>
                <Dropdown
                    value={this.props.sel.namespace || ""}
                    placeholder="select namespace"
                    options={listItems}
                    onChange={this.onSelectNamespace}
                    disabled={this.props.disabled || this.props.sel.scope !== QueryScope.SINGLE_NAMESPACE}
                    button search selection
                />
                <span className="padded-radio">
                    <Checkbox radio name="nsgroup"
                              disabled={this.props.disabled}
                              value={QueryScope.ALL_NAMESPACES}
                              checked={this.props.sel.scope === QueryScope.ALL_NAMESPACES}
                              onChange={this.onSelectRadio}
                    />
                </span>
                <Label pointing="left" content="All namespaces"/>
                <span className="padded-radio">
                    <Checkbox radio name="nsgroup"
                              disabled={this.props.disabled}
                              value={QueryScope.CLUSTER_OBJECTS}
                              checked={this.props.sel.scope === QueryScope.CLUSTER_OBJECTS}
                              onChange={this.onSelectRadio}
                    />
                </span>
                <Label pointing="left" content="Cluster objects"/>
                <Loader active={this.props.loading} inline size="small"/>
                <ErrorIcon error={this.props.error} prefix="namespace load:"/>
            </div>
        );
    }

    private onSelectNamespace(event, {value}) {
        this.props.onSelect({scope: QueryScope.SINGLE_NAMESPACE, namespace: value});
    }

    private onSelectRadio(event, {value}) {
        this.props.onSelect({scope: value, namespace: this.props.sel.namespace});
    }
}

export const NamespaceList = connect(
    (s: State): INamespaceListProps => {
        const sel = s.selection.namespace || {scope: QueryScope.SINGLE_NAMESPACE, namespace: ""};
        const nl = s.namespaceCache || {contextName: s.selection.context};
        return {
            disabled: nl.loading || !s.selection.context,
            error: (nl.err ? nl.err.message : ""),
            items: nl.namespaces,
            loading: nl.loading,
            sel,
        };
    },
    (dispatch): INamespaceListEvents => {
        return {
            onSelect: (sel) => {
                dispatch(ActionFactory.selectNamespace(sel));
            },
        };
    },
)(NamespaceListUI);
