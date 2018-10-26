import * as clone from "clone";
import * as React from "react";
import {Table} from "semantic-ui-react";
import {InlineObject} from "../common/inline-object";
import {ObjectLink} from "../common/object-link";

export interface IVolumeProps {
    namespace: string;
    volumes: any;
}

export class Volumes extends React.Component<IVolumeProps, {}> {
    public render() {
        const rows = (this.props.volumes || []).map( (vol) => {
            const copy = clone(vol);
            delete(copy.name);
            const keys = Object.keys(copy);
            const vType = keys[0];
            let vField: any = vType;
            if (vField === "configMap") {
                vField = <ObjectLink type="ConfigMap" name={copy[vType].name}
                                     namespace={this.props.namespace}>configMap</ObjectLink>;
            } else if (vField === "secret") {
                vField = <ObjectLink type="Secret" name={copy[vType].secretName}
                                     namespace={this.props.namespace}>secret</ObjectLink>;
            }
            return (
                <Table.Row>
                    <Table.Cell>{vol.name}</Table.Cell>
                    <Table.Cell>{vField}</Table.Cell>
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
