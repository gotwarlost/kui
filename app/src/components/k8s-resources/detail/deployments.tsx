import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {StandardResourceTypes, toSelectorString} from "../../../util";
import {Conditions} from "./common/conditions";
import {InlineObject} from "./common/inline-object";
import {PodTemplate} from "./pods/pod-template-ui";
import {DetailUI} from "./detail-ui";
import {renderList} from "../list";

const render = (item, component) => {
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
        ready: status.readyReplicas,
        unavailable: status.unavailableReplicas,
        updated: status.updatedReplicas,
    };

    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Replicas</Table.Cell>
            <Table.Cell><InlineObject object={replicas}/></Table.Cell>
        </Table.Row>,
    );

    addRow("Min ready (seconds)", spec.minReadySeconds);
    addRow("Revision history limit", spec.revisionHistoryLimit);
    addRow("Paused", spec.paused === undefined ? undefined : (spec.paused ? "yes" : "no"));
    addRow("Progress deadline (seconds)", spec.progressDeadlineSeconds);
    addRow("Observed generation", status.observedGeneration);
    addRow("Collision count", status.collisionCount);

    const statNode = (
        <React.Fragment>
            <Segment raised>
                <h2>Status</h2>
                <Table basic="very" celled compact collapsing>
                    <Table.Row>
                        <Table.Cell textAlign="right">Selector</Table.Cell>
                        <Table.Cell>{toSelectorString(spec.selector)}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell textAlign="right">Strategy</Table.Cell>
                        <Table.Cell>
                            <InlineObject object={spec.strategy} recurseFields={["rollingUpdate"]}/>
                        </Table.Cell>
                    </Table.Row>
                    {rows}
                </Table>
                <Conditions conditions={status.conditions}/>
            </Segment>
        </React.Fragment>
    );

    const rsList = renderList(StandardResourceTypes.REPLICA_SET, {
        displayNamespace: false,
        listName: "Replica sets",
        pageSize: 15,
        qr: component.props.relatedQueryResults("replicasets"),
        showWhenNoResults: false,
    });

    const podTemplateNode = !spec.template ?
        null :
        <PodTemplate namespace={item.metadata.namespace} template={spec.template || {}}/>;

    return (
      <React.Fragment>
          {statNode}
          {rsList}
          {podTemplateNode}
      </React.Fragment>
    );
};

export class DeploymentDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
    }

    protected renderContent(item) {
        return render(item, this);
    }
}
