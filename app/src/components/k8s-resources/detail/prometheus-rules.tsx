import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {InlineObject} from "./common/inline-object";
import {genericDetailForResource} from "./generic-detail";

export const PrometheusRuleDetail = genericDetailForResource(
    (item): React.ReactNode => {
        const spec = (item as any).spec || {};
        const makeRule = (rule) => {
            const rows = [];
            rows.push(rule.alert &&
                <Table.Row>
                    <Table.Cell textAlign="right"><b>Alert</b></Table.Cell>
                    <Table.Cell><b>{rule.alert}</b></Table.Cell>
                </Table.Row>,
            );
            rows.push(rule.record &&
                <Table.Row>
                    <Table.Cell textAlign="right"><b>Record as</b></Table.Cell>
                    <Table.Cell><b>{rule.record}</b></Table.Cell>
                </Table.Row>,
            );
            rows.push(
                <Table.Row>
                    <Table.Cell textAlign="right">Expr</Table.Cell>
                    <Table.Cell><pre className="wrapped">{rule.expr}</pre></Table.Cell>
                </Table.Row>,
            );
            rows.push(rule.for &&
                <Table.Row>
                    <Table.Cell textAlign="right">For</Table.Cell>
                    <Table.Cell>{rule.for}</Table.Cell>
                </Table.Row>,
            );
            rows.push(rule.labels &&
                <Table.Row>
                    <Table.Cell textAlign="right">Labels</Table.Cell>
                    <Table.Cell><InlineObject object={rule.labels || {}} /></Table.Cell>
                </Table.Row>,
            );
            rows.push(rule.annotations &&
                <Table.Row>
                    <Table.Cell textAlign="right">Annotations</Table.Cell>
                    <Table.Cell><InlineObject object={rule.annotations || {}} /></Table.Cell>
                </Table.Row>,
            );
            return (
                <Segment raised>
                    <Table basic="very" celled collapsing compact>
                        {rows}
                    </Table>
                </Segment>
            );
        };
        const makeGroup = (group) => {
            const rules = (group.rules || []).map(makeRule);
            return (
                <React.Fragment>
                    <h3>{group.name}</h3>
                    {rules}
                </React.Fragment>
            );
        };
        const groups = (spec.groups || []).map(makeGroup);
        return (
            <React.Fragment>
                {groups}
            </React.Fragment>
        );
    },
);
