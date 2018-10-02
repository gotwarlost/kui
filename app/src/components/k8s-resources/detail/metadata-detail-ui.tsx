import * as clone from "clone";
import * as React from "react";
import {Label, Popup, Table} from "semantic-ui-react";
import {ageInWords} from "../../../util";

const lastApplied = "kubectl.kubernetes.io/last-applied-configuration";

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
}

export interface IMetadataProps {
    metadata: any;
    kind: string;
}

export const renderObject = (obj: object): React.ReactNode => {
    if (!obj) {
        return null;
    }
    obj = clone(obj);
    delete(obj[lastApplied]);
    const keys = Object.keys(obj).sort();
    if (keys.length === 0) {
        return null;
    }
    const data = keys.map((key) => {
        if (key === lastApplied) {
            return null; // TODO: render this some other way
        }
        const value = obj[key];
        let v = value;
        if (value.length > 40) {
            const trig = <span>{value.substring(0, 37)}{"..."}</span>;
            v = (
                <Popup trigger={trig} wide="very">
                    {value}
                </Popup>
            );
        }
        return (
            <span className="label-item" key={key}>
                        <Label pointing="right">{key}</Label>{v}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
        );
    });
    return (
        <React.Fragment>
            {data}
        </React.Fragment>
    );
};

export class MetadataDetailUI extends React.Component<IMetadataProps, {}> {
    public render() {
        const meta = this.props.metadata as IMetadata;

        const labelData = renderObject(meta.labels);
        let labelRow = null;
        if (labelData !== null) {
            labelRow = (
                <Table.Row>
                    <Table.Cell textAlign="right">Labels</Table.Cell>
                    <Table.Cell>{labelData}</Table.Cell>
                </Table.Row>
            );
        }

        const annData = renderObject(meta.annotations);
        let annRow = null;
        if (annData !== null) {
            annRow = (
                <Table.Row>
                    <Table.Cell textAlign="right">Annotations</Table.Cell>
                    <Table.Cell>{annData}</Table.Cell>
                </Table.Row>
            );
        }
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
                </Table.Body>
            </Table>
        );
    }
}
