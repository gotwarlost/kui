import * as React from "react";
import {connect} from "react-redux";
import {Icon, Segment} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {overviewTitle, State, StateReader} from "../model/state";
import {IResourceGroup, ResourceQueryResults} from "../model/types";

type countFn = (name: string) => any;
type loadingFn = (name: string) => boolean;
type errorFn = (name: string) => boolean;
type selectFn = (name: string) => boolean;
type clickFn = (evt: any, props: ILinkItemProps) => any;

interface IResultFinder {
    countFn: countFn;
    loadingFn: loadingFn;
    errorFn: errorFn;
    selectFn: selectFn;
}

interface ILinkItemProps {
    title: string;
    name: string;
    count?: any;
    loading?: boolean;
    err?: any;
    selected?: boolean;
    onClick: clickFn;
    allResourceTypes: string[];
}

class LinkItem extends React.Component<ILinkItemProps, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const title = this.props.title || "<unknown resource>";

        if (!this.props.selected && typeof this.props.count === "number" && this.props.count === 0) {
            return null;
        }

        return (
            <div className={this.props.selected ? "list-link list-link-selected" : "list-link"}>
                <a href="#" onClick={this.onClick}>
                    {title}
                    &nbsp;
                    {typeof(this.props.count) === "number" ? " (" + this.props.count + ")" : ""}
                    {this.props.loading && <Icon name="wait" className="grey"/>}
                    {this.props.err && <Icon name="warning sign" className="orange"/>}
                </a>
            </div>
        );
    }

    private onClick(evt: any) {
        return this.props.onClick(evt, this.props);
    }
}

interface IGroupProps {
    group: IResourceGroup;
    finder: IResultFinder;
    onClick: clickFn;
    allResourceTypes: string[];
}

class GroupItem extends React.Component<IGroupProps, {}> {
    public render() {
        const title = this.props.group.name || "core and extensions";
        if (this.props.group.resources.length === 0) {
            return null;
        }
        let counted = true;
        let count = 0;
        let sel = false;
        const results = [];
        this.props.group.resources.forEach((res) => {
            const attrs = {
                allResourceTypes: this.props.allResourceTypes,
                count: this.props.finder.countFn(res.id),
                err: this.props.finder.errorFn(res.id),
                loading: this.props.finder.loadingFn(res.id),
                name: res.id,
                onClick: this.props.onClick,
                selected: this.props.finder.selectFn(res.id),
                title: res.pluralName,
            };
            results.push(attrs);
            if (attrs.selected) {
                sel = true;
            }
            if (typeof attrs.count === "number") {
                count += attrs.count;
            } else {
                counted = false;
            }
        });
        if (!sel && counted && count === 0) {
            return null;
        }
        return (
            <React.Fragment>
                <h4 style={{margin: "0.5em 0", fontWeight: "normal" }}>{title}</h4>
                    {
                        results.map( (attrs) => {
                            return React.createElement(LinkItem, attrs, {});
                        })
                    }
            </React.Fragment>
        );
    }
}

export interface ILeftNavProps {
    allResources: IResourceGroup[];
    allResourceTypes: string[];
    enabled: boolean;
    finder: IResultFinder;
}

export interface ILeftNavEvents {
    onClick: clickFn;
}

export interface ILeftNav extends ILeftNavProps, ILeftNavEvents {
}

export class LeftNavUI extends React.Component<ILeftNav, {}> {
    public render() {
        if (!this.props.enabled) {
            return null;
        }
        const groupItems = this.props.allResources.map( (group) => {
            return (
                <GroupItem group={group}
                           finder={this.props.finder}
                           allResourceTypes={this.props.allResourceTypes}
                           onClick={this.props.onClick}/>
            );
        });
        return (
            <Segment raised>
                <h3 style={{marginBottom: 0, paddingBottom: 0}}>
                    <LinkItem
                        allResourceTypes={this.props.allResourceTypes}
                        title={overviewTitle}
                        name=""
                        onClick={this.props.onClick}
                        selected={this.props.finder.selectFn("")}
                    />
                </h3>
                {groupItems}
            </Segment>
        );
    }
}

export const LeftNav = connect(
    (s: State): ILeftNavProps => {
        const ns = s.selection.namespace;
        const allResources = StateReader.getResources(s, ns.scope) || [];
        const allResourceTypes = [];
        allResources.forEach( (g) => {
            g.resources.forEach( (r) => { allResourceTypes.push(r.id); });
        });
        const getData = (name: string): ResourceQueryResults => {
            const key = StateReader.listQueryKey(s, name);
            return StateReader.getResults(s, { path: key });
        };
        const finder = {
            countFn: (name: string) => {
                if (name === "") {
                    return undefined;
                }
                const qr = getData(name);
                if (qr && qr.results) {
                    const items = (qr.results as any).items;
                    if (items && items.hasOwnProperty("length")) {
                        return items.length;
                    }
                }
                return null;
            },
            errorFn: (name: string) => {
                if (name === "") {
                    return false;
                }
                const qr = getData(name);
                return qr && !!qr.err;
            },
            loadingFn: (name: string) => {
                if (name === "") {
                    return false;
                }
                const qr = getData(name);
                return qr && qr.loading;
            },
            selectFn: (name: string) => {
                const sel = StateReader.getListPageSelection(s);
                if (!(sel.resourceTypes && sel.resourceTypes.length)) {
                    return false;
                }
                if (sel.resourceTypes.length > 1) {
                    return name === "";
                }
                return sel.resourceTypes[0] === name;
            },
        };
        return {
            allResourceTypes,
            allResources,
            enabled : !!StateReader.getListPageSelection(s),
            finder,
        };
    },
    (dispatch): ILeftNavEvents => {
        return {
            onClick: (evt, props) => {
                evt.preventDefault();
                const resources = props.name !== "" ? [ props.name ] : props.allResourceTypes;
                dispatch(ActionFactory.selectListPage(props.title, resources));
            },
        };
    },
)(LeftNavUI);
