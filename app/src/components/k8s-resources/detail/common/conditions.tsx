import * as React from "react";
import {Table} from "semantic-ui-react";
import {ageInWords} from "../../../../util";

export interface IConditionProps {
    conditions: any;
}

export class Conditions extends React.Component<IConditionProps, {}> {
    public render() {
        if (typeof this.props.conditions === "undefined") {
            return null;
        }
        const items = this.props.conditions.map( (cond) => {
            return (
                <Table.Row>
                    <Table.Cell>{cond.type}</Table.Cell>
                    <Table.Cell>{cond.status}</Table.Cell>
                    <Table.Cell>{cond.message}</Table.Cell>
                    <Table.Cell>
                    <span title={cond.lastHeartbeatTime}>
                        {ageInWords(cond.lastHeartbeatTime)}
                    </span>
                    </Table.Cell>
                    <Table.Cell>
                    <span title={cond.lastHeartbeatTime}>
                        {ageInWords(cond.lastTransitionTime)}
                    </span>
                    </Table.Cell>
                </Table.Row>
            );
        });
        return (
            <React.Fragment>
                <h3>Conditions</h3>
                <Table basic="very" celled collapsing compact>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Condition</Table.HeaderCell>
                            <Table.HeaderCell>Value</Table.HeaderCell>
                            <Table.HeaderCell>Message</Table.HeaderCell>
                            <Table.HeaderCell>Heartbeat</Table.HeaderCell>
                            <Table.HeaderCell>Transition</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {items}
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }
}
