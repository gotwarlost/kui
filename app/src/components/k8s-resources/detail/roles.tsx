import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {genericDetailForResource} from "./generic-detail";

const renderFn = (item): React.ReactNode => {
    const rules = (item as any).rules || [];
    let count = 0;
    const items = rules.map((rule: any) => {
        count++;
        const arrayStr = (arr) => {
            arr = arr || [];
            if (arr.length === 0) {
                return "*";
            }
            return arr.join(", ");
        };
        return (
            <Table.Row key={count}>
                <Table.Cell>{arrayStr(rule.apiGroups)}</Table.Cell>
                <Table.Cell>{arrayStr(rule.verbs)}</Table.Cell>
                <Table.Cell>{arrayStr(rule.resources)}</Table.Cell>
                <Table.Cell>{arrayStr(rule.resourceNames)}</Table.Cell>
            </Table.Row>
        );
    });
    const header = (
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>API groups</Table.HeaderCell>
                <Table.HeaderCell>Verbs</Table.HeaderCell>
                <Table.HeaderCell>Resources</Table.HeaderCell>
                <Table.HeaderCell>Resource names</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
    );
    return (
        <Segment raised>
            <h3>Permissions</h3>
            <Table basic="very" celled collapsing compact>
                {header}
                <Table.Body>
                    {items}
                </Table.Body>
            </Table>
        </Segment>
    );
};

export const RoleDetail = genericDetailForResource(
    renderFn,
);
