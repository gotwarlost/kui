import * as React from "react";
import {connect} from "react-redux";
import {Icon, List, Segment} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {overviewTitle, State, StateReader} from "../model/state";
import {IResourceGroup, IResourceInfo, ListPageSelection} from "../model/types";

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
    finder: IResultFinder;
    onClick: clickFn;
    resources: string[];
}

class LinkItem extends React.Component<ILinkItemProps, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const title = this.props.title || "<unknown resource>";
        const selected = this.props.finder.selectFn(this.props.name);
        const count = this.props.finder.countFn(this.props.name);
        const loading = this.props.finder.loadingFn(this.props.name);
        const err = this.props.finder.errorFn(this.props.name);

        if (typeof count === "number" && count === 0) {
            return null;
        }

        return (
            <div className={selected ? "list-link list-link-selected" : "list-link"}>
                <a href="#" onClick={this.onClick}>
                    {title}
                    &nbsp;
                    {typeof(count) === "number" ? " (" + count + ")" : ""}
                    {loading && <Icon name="wait" className="grey"/>}
                    {err && <Icon name="warning sign" className="orange"/>}
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
}

class GroupItem extends React.Component<IGroupProps, {}> {
    public render() {
        const title = this.props.group.name;
        if (this.props.group.resources.length === 0) {
            return null;
        }
        let counted = true;
        let count = 0;
        let sel = false;
        this.props.group.resources.forEach((res) => {
            if (this.props.finder.selectFn(res.id)) {
                sel = true;
            }
            const c = this.props.finder.countFn(res.id);
            if (typeof c === "number") {
                count += c;
            } else {
                counted = false;
            }
        });
        if (!sel && counted && count === 0) {
            return null;
        }
        return (
            <React.Fragment>
                <h3 style={{marginBottom: 0}}>{title}</h3>
                <List>
                    {
                        this.props.group.resources.map( (res) => {
                            return (
                                <List.Item>
                                    <LinkItem name={res.id}
                                              title={res.pluralName}
                                              finder={this.props.finder}
                                              resources={[res.id]}
                                              onClick={this.props.onClick} />
                                </List.Item>
                            );
                        })
                    }
                </List>
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
                <List.Item>
                    <GroupItem group={group} finder={this.props.finder} onClick={this.props.onClick}/>
                 </List.Item>
            );
        });
        return (
            <Segment raised>
                <List>
                    <List.Item key={overviewTitle}>
                        <h3>
                            <LinkItem
                                title={overviewTitle}
                                name={""}
                                finder={this.props.finder}
                                onClick={this.props.onClick}
                                resources={this.props.allResourceTypes}
                            />
                        </h3>
                    </List.Item>
                    {groupItems}
                </List>
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
        const finder = {
            countFn: (name: string) => {
                if (name === "") {
                    return undefined;
                }
                const key = StateReader.listQueryKey(s, name);
                const qr = s.data[key];
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
                const key = StateReader.listQueryKey(s, name);
                const qr = s.data[key];
                return qr && !!qr.err;
            },
            loadingFn: (name: string) => {
                if (name === "") {
                    return false;
                }
                const key = StateReader.listQueryKey(s, name);
                const qr = s.data[key];
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
                dispatch(ActionFactory.selectListPage(props.title, props.resources));
            },
        };
    },
)(LeftNavUI);
