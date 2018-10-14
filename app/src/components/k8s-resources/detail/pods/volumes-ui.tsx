import * as clone from "clone";
import * as React from "react";
import {Table} from "semantic-ui-react";
import {InlineObject} from "../common/inline-object";

export interface IVolumeProps {
    volumes: any;
}

export class Volumes extends React.Component<IVolumeProps, {}> {
    public render() {
        const rows = (this.props.volumes || []).map( (vol) => {
            const copy = clone(vol);
            delete(copy.name);
            const keys = Object.keys(copy);
            const vType = keys[0];
            return (
                <Table.Row>
                    <Table.Cell>{vol.name}</Table.Cell>
                    <Table.Cell>{vType}</Table.Cell>
                    <Table.Cell><InlineObject object={copy[vType]}/></Table.Cell>
                </Table.Row>
            );
        });
        return (
            <Table celled collapsing compact>
                <Table.Header>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Details</Table.HeaderCell>
                </Table.Header>
                {rows}
            </Table>
        );

    }
}
