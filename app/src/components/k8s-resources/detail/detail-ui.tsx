import * as yaml from "js-yaml";
import * as React from "react";
import {Checkbox, Loader, Message, Segment} from "semantic-ui-react";
import {IResource, ResourceQueryResults} from "../../../model/types";
import {renderList} from "../list";
import {MetadataDetailUI} from "./common/metadata-detail-ui";
import {IListDispatch} from "../list/list-ui";

export type IContentProvider = (item: IResource, thisObj) => React.ReactNode;

export interface IDetailProps {
    kind: string;
    qr: ResourceQueryResults;
    events?: ResourceQueryResults;
}

export interface IDetail extends IDetailProps, IListDispatch {
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

const miniYAMLProvider = (item): React.ReactNode => {
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
};

export class DetailUI extends React.Component<IDetail, IDetailState> {

    protected provider?: IContentProvider;

    constructor(props, state) {
        super(props, state);
        this.toggleYAML = this.toggleYAML.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const provider = this.provider || miniYAMLProvider;
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
            !(loading || err) && (
                <span style={{fontWeight: "normal"}}>
                   <Checkbox toggle onChange={this.toggleYAML} label="YAML"/>
                </span>
            )
        );
        const header = (
            <React.Fragment>
                <h2>
                    {this.props.qr.query.objectId}
                    &nbsp;&nbsp;
                </h2>
                {loading}
                {toggle}
            </React.Fragment>
        );
        let content: React.ReactNode;
        if (!(loading || err)) {
            content = this.renderItem(this.props.kind, this.props.qr.results as IResource, this.props.events, provider);
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

    private renderItem(kind: string, item: IResource, events: ResourceQueryResults,
                       provider: IContentProvider): React.ReactNode {
        if (this._state().showYAML) {
            return renderYAML(item);
        }
        const meta = <MetadataDetailUI kind={kind} metadata={item.metadata}/>;

        const e = !events ? null :
            renderList("v1:Event", {
                displayNamespace: false,
                listName: "Events",
                onSelect: this.props.onSelect,
                pageSize: 15,
                qr: events,
                showWhenNoResults: false,
            });
        const rest = provider(item, this);
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

    private onClick(e: React.SyntheticEvent<HTMLElement>) {
        e.preventDefault();
        if (this.props.onSelect) {
            this.props.onSelect(e, {
                namespace: e.currentTarget.getAttribute("data-namespace"),
                objectID: e.currentTarget.getAttribute("data-name"),
                resourceName: e.currentTarget.getAttribute("data-resource"),
            });
        }
    }
}
