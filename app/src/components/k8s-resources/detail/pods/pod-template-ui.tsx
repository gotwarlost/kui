import * as React from "react";
import {Segment} from "semantic-ui-react";
import {MetadataDetailUI} from "../common/metadata-detail-ui";
import {Pod} from "./pod-ui";

export interface IPodTemplateProps {
    template: any;
}

export class PodTemplate extends React.Component<IPodTemplateProps, {}> {
    public render() {
        const podTemplate = <Pod spec={this.props.template.spec} status={{}} />;
        return (
            <React.Fragment>
                <h2>Pod template</h2>
                <div style={{marginLeft: "2em"}}>
                    <Segment raised>
                        <h2>Metadata</h2>
                        <MetadataDetailUI metadata={this.props.template.metadata} kind={"Pod"} />
                    </Segment>
                {podTemplate}
                </div>
            </React.Fragment>
        );
    }
}
