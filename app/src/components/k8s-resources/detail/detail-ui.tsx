import * as yaml from "js-yaml";
import * as React from "react";
import {Checkbox, Loader, Message, Segment} from "semantic-ui-react";
import {IResource, ResourceQueryResults} from "../../../model/types";
import {renderList} from "../list";
import {MetadataDetailUI} from "./common/metadata-detail-ui";
import {StandardResourceTypes} from "../../../util";

export interface IDetail {
    qr: ResourceQueryResults;
    events?: ResourceQueryResults;
    title?: string;
    hideMetadata?: boolean;
    hideYAMLToggle?: boolean;
}

interface IDetailState {
    showYAML?: boolean;
}

const renderYAML = (item): React.ReactNode => {
    return (
        <React.Fragment>
            <pre className="wrapped prettyprint lang-yaml">
                {yaml.safeDump(item)}
            </pre>
        </React.Fragment>
    );
};

export class DetailUI extends React.Component<IDetail, IDetailState> {

    constructor(props, state) {
        super(props, state);
        this.toggleYAML = this.toggleYAML.bind(this);
    }

    public render() {
        if (!this.props.qr) {
            return null;
        }
        const loading = this.props.qr.loading && (
            <Loader active size="massive" inline="centered"/>
        );
        const err = this.props.qr.err && (
            <Message error>
                <Message.Header>Load error</Message.Header>
                <pre className="wrapped">{this.props.qr.err.message}</pre>
            </Message>
        );
        const toggle = (
            !(loading || err) && !this.props.hideYAMLToggle && (
                <span style={{fontWeight: "normal"}}>
                   <Checkbox toggle onChange={this.toggleYAML} label="YAML"/>
                </span>
            )
        );
        const header = (
            <React.Fragment>
                <h2>
                    {this.props.title || this.props.qr.query.objectId}
                    &nbsp;&nbsp;
                </h2>
                {loading}
                {toggle}
            </React.Fragment>
        );
        let content: React.ReactNode;
        if (!(loading || err)) {
            content = this.renderItem(this.props.qr.results as IResource, this.props.events);
        }
        return (
            <Segment raised>
                {header}
                {err}
                {content}
            </Segment>
        );
    }

    public componentDidUpdate() {
        (window as any).PR.prettyPrint();
    }

    protected renderContent(item: IResource): React.ReactNode {
        if (!item) {
            return null;
        }
        const ob = {};
        Object.keys(item).forEach( (k) => {
            if (k === "metadata" || k === "kind" || k === "apiVersion") {
                return;
            }
            ob[k] = item[k];
        });
        const yml = renderYAML(ob);
        return (
            <React.Fragment>
                <i>This resource does not have a custom renderer, rendering as YAML</i>
                {yml}
            </React.Fragment>
        );
    }

    private renderItem(item: IResource, events: ResourceQueryResults): React.ReactNode {
        if (this._state().showYAML) {
            return renderYAML(item);
        }
        const meta = this.props.hideMetadata ?
            null :
            <MetadataDetailUI kind={item.apiVersion + "/" + item.kind} metadata={item.metadata}/>;

        const e = !events ? null :
            renderList(StandardResourceTypes.EVENT, {
                displayNamespace: false,
                listName: "Events",
                pageSize: 15,
                qr: events,
                showWhenNoResults: false,
            });
        const rest = this.renderContent(item);
        return (
            <div>
                {meta}
                {e}
                {rest}
            </div>
        );
    }

    private _state() {
        return this.state || {showYAML: false};
    }

    private toggleYAML(event, data) {
        this.setState({showYAML: data.checked});
    }
}
