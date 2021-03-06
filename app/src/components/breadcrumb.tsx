import * as React from "react";
import {connect} from "react-redux";
import {Segment} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {overviewTitle, State, StateReader} from "../model/state";
import {ObjectSelection, QueryScope} from "../model/types";
import {collectionName} from "../util";

interface IPart {
    text: string;
    link?: string;
}

interface IBreadcrumbProps {
    parts: IPart[];
    data: any;
}

interface IBreadcrumbEvents {
    onClick(evt: any, props: IBreadcrumbProps);
}

export interface IBreadcrumb extends IBreadcrumbProps, IBreadcrumbEvents {
}

export class BreadcrumbUI extends React.Component<IBreadcrumb, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const parts = this.props.parts;
        const partLinks = [];
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (p.link) {
                partLinks.push(<span><a href={p.link} onClick={this.onClick}>{p.text}</a></span>);
            } else {
                partLinks.push(<span>{p.text}</span>);
            }
            if (i !== parts.length - 1) {
                partLinks.push(<React.Fragment>&nbsp;&nbsp;&raquo;&nbsp;&nbsp;</React.Fragment>);
            }
        }
        return (
            <Segment raised>
                {partLinks}
            </Segment>
        );
    }

    private onClick(evt: any) {
        return this.props.onClick(evt, this.props);
    }
}

export const Breadcrumb = connect(
    (s: State): IBreadcrumbProps => {
        const makeParts = (): IPart[] => {
            const sel = s.selection;
            const parts: IPart[] = [];
            if (!sel.context) {
                return parts;
            }
            parts.push({text: sel.context});
            if (!StateReader.isNamespaceSelected(s)) {
                return parts;
            }
            const ns = sel.namespace;
            if (ns.scope === QueryScope.SINGLE_NAMESPACE) {
                parts.push({text: ns.namespace});
            } else if (ns.scope === QueryScope.ALL_NAMESPACES) {
                parts.push({text: "All namespaces"});
            } else {
                parts.push({text: "Cluster objects"});
            }
            const ls = StateReader.getListPageSelection(s);
            const os = StateReader.getObjectSelection(s);
            if (os) {
                const mi = StateReader.getResourceInfo(s, os.resourceType);
                if (mi) {
                    parts.push({text: collectionName(mi), link: "list page"});
                    parts.push({text: os.name});
                }
            } else if (ls) {
                if (ls.resourceTypes.length > 1) {
                    parts.push({text: overviewTitle});
                } else if (ls.resourceTypes.length === 1) {
                    const ri = StateReader.getResourceInfo(s, ls.resourceTypes[0]);
                    if (ri) {
                        parts.push({text: collectionName(ri)});
                    }
                }
            }
            return parts;
        };
        return {parts: makeParts(), data: StateReader.getObjectSelection(s) };
    },
    (dispatch): IBreadcrumbEvents => {
        return {
            onClick: (evt, props) => {
                evt.preventDefault();
                const data = props.data as ObjectSelection;
                if (data) {
                    dispatch(ActionFactory.selectListPage("", [data.resourceType]));
                }
            },
        };
    },
)(BreadcrumbUI);
