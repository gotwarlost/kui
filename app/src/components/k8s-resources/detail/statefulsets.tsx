import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {genericDetailForResource} from "./generic-detail";
import {Conditions} from "./common/conditions";
import {InlineObject} from "./common/inline-object";
import {PodTemplate} from "./pods/pod-template-ui";
import {formatResources} from "./common/resources";

const vcTemplate = (template, num) => {
    const spec = template.spec || {};
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

    if (template.metadata && template.metadata.labels) {
        addRow("Labels", <InlineObject object={template.metadata.labels}/>);
    }

    if (spec.accessModes && spec.accessModes.length > 0) {
        addRow("Access modes", spec.accessModes.join(", "));
    }
    if (spec.selector) {
        addRow("Selector", toSelectorString(spec.selector));
    }
    if (spec.resources && (spec.resources.requests || spec.resources.limits)) {
        rows.push(
            <Table.Row>
                <Table.Cell textAlign="right">Resources</Table.Cell>
                <Table.Cell>{formatResources(spec.resources)}</Table.Cell>
            </Table.Row>,
        );
    }

    addRow("Volume name", spec.volumeName);
    addRow("Storage class name", spec.storageClassName);
    addRow("Volume mode", spec.volumeMode);

    const specs = rows.length === 0 ? null : (
        <Table basic="very" celled collapsing>
            {rows}
        </Table>
    );

    return (
      <React.Fragment>
          <h2>Volume claim template #{num}</h2>
          <div style={{marginLeft: "2em"}}>
              <Segment raised>
                {specs}
              </Segment>
          </div>
      </React.Fragment>
    );
};

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
        current: status.currentReplicas,
        desired: status.replicas,
        ready: status.readyReplicas,
        updated: status.updatedReplicas,
    };

    const revisions = {
        current: status.currentRevision,
        update: status.updateRevision,
    };

    addRow("Pod management policy", spec.podManagementPolicy);

    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Replicas</Table.Cell>
            <Table.Cell><InlineObject object={replicas}/></Table.Cell>
        </Table.Row>,
    );

    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Revisions</Table.Cell>
            <Table.Cell><InlineObject object={revisions}/></Table.Cell>
        </Table.Row>,
    );

    addRow("Min ready (seconds)", spec.minReadySeconds);
    addRow("Revision history limit", spec.revisionHistoryLimit);
    addRow("Paused", spec.paused === undefined ? undefined : (spec.paused ? "yes" : "no"));
    addRow("Progress deadline (seconds)", spec.progressDeadlineSeconds);
    addRow("Observed generation", status.observedGeneration);
    addRow("Collision count", status.collisionCount);

    const volumeTemplates = [];
    (spec.volumeClaimTemplates || []).forEach( (vct, num) => {
        volumeTemplates.push(vcTemplate(vct, num + 1));
    });

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
                        <Table.Cell textAlign="right">Service name</Table.Cell>
                        <Table.Cell>{spec.serviceName}</Table.Cell>
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
            {volumeTemplates}
        </React.Fragment>
    );

    return (
      <React.Fragment>
          {statNode}
          <PodTemplate template={spec.template}/>
      </React.Fragment>
    );
};

export const StatefulsetDetail = genericDetailForResource("statefulsets", render);
