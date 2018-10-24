import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {Conditions} from "./common/conditions";
import {InlineObject} from "./common/inline-object";
import {PodTemplate} from "./pods/pod-template-ui";
import {DetailUI} from "./detail-ui";

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
        "available": status.numberAvailable,
        "current": status.currentNumberScheduled,
        "desired": status.desiredNumberScheduled,
        "mis-scheduled": status.numberMisscheduled,
        "ready": status.numberReady,
        "unavailable": status.numberUnavailable,
        "updated": status.updatedNumberScheduled,
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
                            <InlineObject object={spec.updateStrategy} recurseFields={["rollingUpdate"]}/>
                        </Table.Cell>
                    </Table.Row>
                    {rows}
                </Table>
                <Conditions conditions={status.conditions}/>
            </Segment>
        </React.Fragment>
    );

    const podTemplateNode = !spec.template ? null : <PodTemplate template={spec.template || {}}/>;

    return (
      <React.Fragment>
          {statNode}
          {podTemplateNode}
      </React.Fragment>
    );
};

export class DaemonsetDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
        this.provider = render;
    }
}
