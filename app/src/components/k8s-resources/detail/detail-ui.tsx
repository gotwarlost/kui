import * as yaml from "js-yaml";
import * as React from "react";
import {Checkbox, Loader, Message, Segment} from "semantic-ui-react";
import {IResource, ResourceQueryResults} from "../../../model/types";
import {MetadataDetailUI} from "./common/metadata-detail-ui";

export type IContentProvider = (item: IResource, thisObj) => React.ReactNode;

export interface IDetailProps {
    kind: string;
    qr: ResourceQueryResults;
    provider: IContentProvider;
}

export interface IDetailDispatch {
    onBack(event: any);
}

export interface IDetail extends IDetailProps, IDetailDispatch {
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
    constructor(props, state) {
        super(props, state);
        this.onBack = this.onBack.bind(this);
        this.toggleYAML = this.toggleYAML.bind(this);
    }

    public render() {
        const provider = this.props.provider || miniYAMLProvider;
        if (!this.props.qr) {
            return null;
        }
        const loading = this.props.qr.loading && (
            <Loader active size="massive" inline="centered"/>
        );
        const err = this.props.qr.err && (
            <Message error>
                <Message.Header>Load error</Message.Header>
                {this.props.qr.err.message}
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
                    {this.props.qr.query.objectName}
                    &nbsp;&nbsp;
                </h2>
                {loading}
                {toggle}
            </React.Fragment>
        );
        let content: React.ReactNode;
        if (!(loading || err)) {
            content = this.renderItem(this.props.kind, this.props.qr.results as IResource, provider);
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

    private renderItem(kind: string, item: IResource, provider: IContentProvider): React.ReactNode {
        if (!this._state().showYAML) {
            const meta = <MetadataDetailUI kind={kind} metadata={item.metadata}/>;
            const rest = provider(item, this);
            return (
                <div>
                    {meta}
                    {rest}
                </div>
            );
        }
        return renderYAML(item);
    }

    private _state() {
        return this.state || {showYAML: false};
    }

    private toggleYAML(event, data) {
        this.setState({showYAML: data.checked});
    }

    private onBack(e: React.SyntheticEvent<{}>) {
        e.preventDefault();
        if (this.props.onBack) {
            this.props.onBack(e);
        }
    }
}
