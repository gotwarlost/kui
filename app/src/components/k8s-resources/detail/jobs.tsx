import * as React from "react";
import {Segment, Table} from "semantic-ui-react";
import {ageInWords, toSelectorString} from "../../../util";
import {genericDetailForResource} from "./generic-detail";
import {Conditions} from "./common/conditions";
import {InlineObject} from "./common/inline-object";
import {PodTemplate} from "./pods/pod-template-ui";

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

    if (spec.selector) {
        addRow("Selector", toSelectorString(spec.selector));
    }
    addRow("Active pods", status.active);
    addRow("Successful pods", status.succeeded);
    addRow("Failed pods", status.failed);

    if (status.startTime) {
        const s = (
            <React.Fragment>
                {ageInWords(status.startTime)}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <small>{"(" + status.startTime + ")"}</small>
            </React.Fragment>
        );
        addRow("Start time", s);
    }
    if (status.completionTime) {
        const e = (
            <React.Fragment>
                {ageInWords(status.completionTime)}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <small>{"(" + status.completionTime + ")"}</small>
            </React.Fragment>
        );
        addRow("Completion time", e);
    }

    addRow("Manual selector", spec.manualSelector === undefined ? undefined : ( spec.manualSelector ? "yes" : "no" ));
    addRow("Parallelism", spec.parallelism);
    addRow("Completions", spec.completions);
    addRow("Backoff limit", spec.backoffLimit);
    addRow("Active deadline (seconds)", spec.activeDeadlineSeconds);
    addRow("Min ready (seconds)", spec.minReadySeconds);
    addRow("Revision history limit", spec.revisionHistoryLimit);
    addRow("Paused", spec.paused === undefined ? undefined : (spec.paused ? "yes" : "no"));
    addRow("Observed generation", status.observedGeneration);
    addRow("Collision count", status.collisionCount);

    const statNode = (
        <React.Fragment>
            <Segment raised>
                <h2>Status</h2>
                <Table basic="very" celled compact collapsing>
                    {rows}
                </Table>
                <Conditions conditions={status.conditions}/>
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

export const JobDetail = genericDetailForResource("jobs", render);
