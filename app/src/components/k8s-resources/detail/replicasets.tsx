import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {genericDetailForResource} from "./generic-detail";
import {PodTemplate} from "./pods/pod-template-ui";
import {Conditions} from "./common/conditions";
import {InlineObject} from "./common/inline-object";

const render = (item) => {
    const spec = item.spec || {};
    const status = item.status || {};
    const rows = [];
    const addRow = (prompt, value) => {
        if (typeof value === "undefined") {
            return;
        }
        rows.push(
            <Table.Row>
                <Table.Cell textAlign="right">{prompt}</Table.Cell>
                <Table.Cell>{value}</Table.Cell>
            </Table.Row>,
        );
    };

    const replicas = {
        available: status.availableReplicas,
        desired: status.replicas,
        fullyLabeled: status.fullyLabeledReplicas,
        ready: status.readyReplicas,
    };

    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Replicas</Table.Cell>
            <Table.Cell><InlineObject object={replicas}/></Table.Cell>
        </Table.Row>,
    );

    addRow("Min ready (seconds)", spec.minReadySeconds);
    addRow("Observed generation", status.observedGeneration);

    const statNode = (
        <React.Fragment>
            <Segment raised>
                <h2>Status</h2>
                <Table basic="very" celled compact collapsing>
                    <Table.Row>
                        <Table.Cell textAlign="right">Selector</Table.Cell>
                        <Table.Cell>{toSelectorString(spec.selector)}</Table.Cell>
                    </Table.Row>
                    {rows}
                </Table>
                <Conditions conditions={status.conditions} />
            </Segment>
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