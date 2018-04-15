import * as React from "react";
import {connect} from "react-redux";
import {List, Segment} from "semantic-ui-react";
import {overviewTitle, State, StateReader} from "../model/state";
import {IResourceInfo, ListPageSelection, QueryScope} from "../model/types";
import {ListPageLink} from "./list-page-link";

type countFn = (name: string) => any;
type loadingFn = (name: string) => boolean;
type errorFn = (name: string) => boolean;
type typedetailFn = (name: string) => IResourceInfo;

export interface ILeftNav {
    allResources: string[];
    overviewResources: string[];
    selection: ListPageSelection;
    counter: countFn;
    loading: loadingFn;
    typeFor: typedetailFn;
    error: errorFn;
}

export class LeftNavUI extends React.Component<ILeftNav, {}> {
    public render() {
        if (!this.props.selection) {
            return null;
        }
        const links = [];
        const selectedTitle = this.props.selection.title;
        this.props.allResources.forEach((name) => {
            const info = this.props.typeFor(name);
            if (info) {
                links.push((
                    <List.Item key={name}>
                        <ListPageLink
                            title={info.pluralName}
                            resources={[name]}
                            selectedTitle={selectedTitle}
                            count={this.props.counter(name)}
                            loading={this.props.loading(name)}
                            error={this.props.error(name)}
                        />
                    </List.Item>
                ));
            }
        });
        return (
            <Segment raised>
                <List>
                    <List.Item key={overviewTitle}>
                        <h3>
                            <ListPageLink
                                title={overviewTitle}
                                resources={this.props.overviewResources}
                                selectedTitle={selectedTitle}
                            />
                        </h3>
                    </List.Item>
                    {...links}
                </List>
            </Segment>
        );
    }
}

export const LeftNav = connect(
    (s: State): ILeftNav => {
        const ns = s.selection.namespace;
        const allInfo = StateReader.getResources(s, ns.scope) || [];
        const allResources = allInfo.map((item) => item.name);
        const counter = (name: string) => {
            const key = StateReader.listQueryKey(s, name);
            const qr = s.data[key];
            if (qr && qr.results) {
                const items = (qr.results as any).items;
                if (items && items.hasOwnProperty("length")) {
                    return items.length;
                }
            }
            return null;
        };
        const loading = (name: string) => {
            const key = StateReader.listQueryKey(s, name);
            const qr = s.data[key];
            return qr && qr.loading;
        };
        const error = (name: string) => {
            const key = StateReader.listQueryKey(s, name);
            const qr = s.data[key];
            return qr && !!qr.err;
        };
        const typeFor = (name: string): IResourceInfo => {
            return StateReader.getResourceInfo(s, name);
        };
        return {
            allResources,
            counter,
            error,
            loading,
            overviewResources: allResources,
            selection: StateReader.getListPageSelection(s),
            typeFor,
        };
    },
    (dispatch): {} => {
        return {};
    },
)(LeftNavUI);
