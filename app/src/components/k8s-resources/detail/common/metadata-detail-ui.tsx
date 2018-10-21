import * as React from "react";
import {Table} from "semantic-ui-react";
import {ageInWords} from "../../../../util";
import {InlineObject} from "./inline-object";
import {ObjectLink} from "./object-link";

interface IMetadata {
    name: string;
    namespace?: string;
    selfLink: string;
    uid: string;
    generation: string;
    resourceVersion: string;
    creationTimestamp: string;
    annotations?: object;
    labels?: object;
    ownerReferences?: any[];
}

export interface IMetadataProps {
    metadata: any;
    kind: string;
}

export class MetadataDetailUI extends React.Component<IMetadataProps, {}> {
    public render() {
        const meta = this.props.metadata as IMetadata;

        const labelRow = (meta.labels && Object.keys(meta.labels).length > 0) ? (
            <Table.Row>
                <Table.Cell textAlign="right">Labels</Table.Cell>
                <Table.Cell><InlineObject object={meta.labels}/></Table.Cell>
            </Table.Row>
        ) : null;

        const annRow = (meta.annotations && Object.keys(meta.annotations).length > 0) ? (
            <Table.Row>
                <Table.Cell textAlign="right">Annotations</Table.Cell>
                <Table.Cell><InlineObject object={meta.annotations}/></Table.Cell>
            </Table.Row>
        ) : null;

        const generationRow = meta.generation !== undefined && (
            <Table.Row>
                <Table.Cell textAlign="right">Generation</Table.Cell>
                <Table.Cell>{meta.generation}</Table.Cell>
            </Table.Row>
        );
        const resourceVersionRow = meta.resourceVersion && (
            <Table.Row>
                <Table.Cell textAlign="right">Resource&nbsp;version</Table.Cell>
                <Table.Cell>{meta.resourceVersion}</Table.Cell>
            </Table.Row>
        );
        const createdRow = meta.creationTimestamp && (
            <Table.Row>
                <Table.Cell textAlign="right">Created</Table.Cell>
                <Table.Cell>
                    {ageInWords(meta.creationTimestamp)}
                    <small>
                        {" ("}
                        {meta.creationTimestamp}
                        {")"}
                    </small>
                </Table.Cell>
            </Table.Row>
        );
        const nsRow = meta.namespace && (
            <Table.Row>
                <Table.Cell textAlign="right">Namespace</Table.Cell>
                <Table.Cell>{meta.namespace}</Table.Cell>
            </Table.Row>
        );
        const ownerRow = meta.ownerReferences &&  meta.ownerReferences.length > 0 && (
            <Table.Row>
                <Table.Cell textAlign="right">Owner</Table.Cell>
                <Table.Cell>{
                    meta.ownerReferences.map( (ref) => {
                        return (
                          <React.Fragment>
                              <ObjectLink type={ref.apiVersion + ":" + ref.kind}
                                          name={ref.name}
                                          namespace={meta.namespace || ""}
                              />
                          </React.Fragment>
                        );
                    })
                }</Table.Cell>
            </Table.Row>
        );
        return (
            <Table basic="very" celled collapsing compact>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell textAlign="right">Type</Table.Cell>
                        <Table.Cell>{this.props.kind}</Table.Cell>
                    </Table.Row>
                    {nsRow}
                    {createdRow}
                    {labelRow}
                    {annRow}
                    {resourceVersionRow}
                    {generationRow}
                    {ownerRow}
                </Table.Body>
            </Table>
        );
    }
}
