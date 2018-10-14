import * as React from "react";
import {Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {genericDetailForResource} from "./generic-detail";
import {PodTemplate} from "./pods/pod-template-ui";

const render = (item) => {
    const spec = item.spec || {};
    const status = item.status || {};

    const statNode = (
        <React.Fragment>
            <h2>Status</h2>
            <Table basic="very" celled compact collapsing>
                <Table.Row>
                    <Table.Cell textAlign="right">Selector</Table.Cell>
                    <Table.Cell>{toSelectorString(spec.selector)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign="right">Desired replicas</Table.Cell>
                    <Table.Cell>{status.replicas}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign="right">Available replicas</Table.Cell>
                    <Table.Cell>{status.availableReplicas}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign="right">Ready replicas</Table.Cell>
                    <Table.Cell>{status.readyReplicas}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign="right">Fully labeled replicas</Table.Cell>
                    <Table.Cell>{status.fullyLabeledReplicas}</Table.Cell>
                </Table.Row>
            </Table>
        </React.Fragment>
    );

    return (
      <React.Fragment>
          {statNode}
          <PodTemplate template={spec.template}/>
      </React.Fragment>
    );
};

export const ReplicaSetDetail = genericDetailForResource("replicasets", render);
