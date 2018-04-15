import * as React from "react";
import {Table} from "semantic-ui-react";
import {genericDetailForResource} from "./generic-detail";

export const ResourceQuotaDetail = genericDetailForResource(
    "resourcequotas",
    (item): React.ReactNode => {
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
                    <Table.Cell>{limit}</Table.Cell>
                    <Table.Cell>{quotaSpec[limit] || ""}</Table.Cell>
                    <Table.Cell>{quotaStatus[limit] || ""}</Table.Cell>
                    <Table.Cell>{usedStatus[limit] || ""}</Table.Cell>
                </Table.Row>
            );
        });
        return (
            <Table basic="very" celled collapsing compact>
                {header}
                <Table.Body>
                    {items}
                </Table.Body>
            </Table>
        );
    },
);
