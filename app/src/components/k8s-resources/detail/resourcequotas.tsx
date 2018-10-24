import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {DetailUI} from "./detail-ui";

const render = (item): React.ReactNode => {
    const spec = (item as any).spec || {};
    const status = (item as any).status || {};
    const quotaSpec = spec.hard || {};
    const quotaStatus = status.hard || {};
    const usedStatus = status.used || {};
    const allKeys = {};
    [quotaSpec, quotaStatus, usedStatus].forEach((collection) => {
        Object.keys(collection).forEach((k) => allKeys[k] = true);
    });
    const limitNames = Object.keys(allKeys).sort();

    const header = (
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Limit</Table.HeaderCell>
                <Table.HeaderCell>Request</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Used</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
    );

    const items = limitNames.map((limit) => {
        return (
            <Table.Row>
                <Table.Cell textAlign="right">{limit}</Table.Cell>
                <Table.Cell textAlign="right">{quotaSpec[limit] || ""}</Table.Cell>
                <Table.Cell textAlign="right">{quotaStatus[limit] || ""}</Table.Cell>
                <Table.Cell textAlign="right">{usedStatus[limit] || ""}</Table.Cell>
            </Table.Row>
        );
    });
    return (
        <Segment raised>
            <h3>Quotas</h3>
            <Table basic="very" celled collapsing compact>
                {header}
                <Table.Body>
                    {items}
                </Table.Body>
            </Table>
        </Segment>
    );
};

export class ResourceQuotaDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
        this.provider = render;
    }
}
