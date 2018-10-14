import * as React from "react";
import {Grid, Segment, Table} from "semantic-ui-react";
import {Conditions} from "./common/conditions";
import {genericDetailForResource} from "./generic-detail";

const getResources = (status): React.ReactFragment => {
    return (
        <React.Fragment>
            <h3>Resources</h3>
            <Table basic="very" celled collapsing compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell></Table.HeaderCell>
                        <Table.HeaderCell>Allocatable</Table.HeaderCell>
                        <Table.HeaderCell>Capacity</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell textAlign="right">CPU</Table.Cell>
                        <Table.Cell textAlign="right">{status.allocatable.cpu}</Table.Cell>
                        <Table.Cell textAlign="right">{status.capacity.cpu}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell textAlign="right">Memory</Table.Cell>
                        <Table.Cell textAlign="right">{status.allocatable.memory}</Table.Cell>
                        <Table.Cell textAlign="right">{status.capacity.memory}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell textAlign="right">Pods</Table.Cell>
                        <Table.Cell textAlign="right">{status.allocatable.pods}</Table.Cell>
                        <Table.Cell textAlign="right">{status.capacity.pods}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </React.Fragment>
    );

};

const getSpec = (spec): React.ReactFragment => {
    return (
        <React.Fragment>
            <h3>Spec</h3>
            <Table basic="very" celled collapsing compact>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Pod CIDR</Table.Cell>
                        <Table.Cell>{spec.podCIDR}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>External ID</Table.Cell>
                        <Table.Cell>{spec.externalID}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Provider ID</Table.Cell>
                        <Table.Cell>{spec.providerID}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </React.Fragment>
    );
};

const getNodeInfo = (status): React.ReactFragment => {
    const infoKeys = Object.keys(status.nodeInfo || {});
    infoKeys.sort();

    const items = infoKeys.map((name) => {
        return (
            <Table.Row>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{status.nodeInfo[name]}</Table.Cell>
            </Table.Row>
        );
    });

    return (
        <React.Fragment>
            <h3>Node info</h3>
            <Table basic="very" celled collapsing compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Key</Table.HeaderCell>
                        <Table.HeaderCell>Value</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {items}
                </Table.Body>
            </Table>
        </React.Fragment>
    );
};

export const NodeDetail = genericDetailForResource(
    "nodes",
    (item): React.ReactNode => {
        const spec = (item as any).spec || {};
        const status = (item as any).status || {};
        return(
            <React.Fragment>
                <Grid stackable>
                    <Grid.Column width={8}>
                        <Segment raised>
                        <Conditions conditions={status.conditions}/>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={8}>
                        <Segment raised>
                        {getResources(status)}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column  width={8}>
                        <Segment raised>
                        {getNodeInfo(status)}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={8}>
                        <Segment raised>
                            {getSpec(spec)}
                        </Segment>
                    </Grid.Column>
                </Grid>
            </React.Fragment>
        );
    },
);
