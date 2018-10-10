import * as React from "react";
import {Segment} from "semantic-ui-react";
import {Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {Container} from "./container-ui";
import {InlineObject} from "./inline-object";
import {Volumes} from "./volumes-ui";

interface IPodProps {
    spec: any;
    status: any;
}

const renderAffinity = (affinity) => {
    return <React.Fragment>implement me!!</React.Fragment>;
};

const renderSpecAttributes = (spec) => {
    const rows = [];
    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Node name</Table.Cell>
            <Table.Cell>{spec.nodeName}</Table.Cell>
        </Table.Row>,
    );

    rows.push(spec.serviceAccountName && (
        <Table.Row>
            <Table.Cell textAlign="right">Service account</Table.Cell>
            <Table.Cell>{spec.serviceAccountName}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.restartPolicy && (
        <Table.Row>
            <Table.Cell textAlign="right">Restart policy</Table.Cell>
            <Table.Cell>{spec.restartPolicy}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.terminationGracePeriodSeconds !== undefined && (
        <Table.Row>
            <Table.Cell textAlign="right">Termination grace period (seconds)</Table.Cell>
            <Table.Cell>{spec.terminationGracePeriodSeconds}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.activeDeadlineSeconds !== undefined && (
        <Table.Row>
            <Table.Cell textAlign="right">Active deadline (seconds)</Table.Cell>
            <Table.Cell>{spec.activeDeadlineSeconds}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.dnsPolicy && (
        <Table.Row>
            <Table.Cell textAlign="right">DNS policy</Table.Cell>
            <Table.Cell>{spec.dnsPolicy}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.nodeSelector && (
        <Table.Row>
            <Table.Cell textAlign="right">Node selector</Table.Cell>
            <Table.Cell>{toSelectorString(spec.nodeSelector)}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.automountServiceAccountToken !== undefined && (
        <Table.Row>
            <Table.Cell textAlign="right">Automount service account token</Table.Cell>
            <Table.Cell>{spec.automountServiceAccountToken}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.hostNetwork && (
        <Table.Row>
            <Table.Cell textAlign="right">Host network</Table.Cell>
            <Table.Cell>true</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.hostPID && (
        <Table.Row>
            <Table.Cell textAlign="right">Host PID namespace</Table.Cell>
            <Table.Cell>true</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.hostIPC && (
        <Table.Row>
            <Table.Cell textAlign="right">Host IPC</Table.Cell>
            <Table.Cell>true</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.shareProcessNamespace && (
        <Table.Row>
            <Table.Cell textAlign="right">Share process namespace</Table.Cell>
            <Table.Cell>true</Table.Cell>
        </Table.Row>
    ));
    rows.push((spec.securityContext && Object.keys(spec.securityContext).length > 0 ) &&
        <Table.Row>
            <Table.Cell verticalAlign="top" textAlign="right">Security Context</Table.Cell>
            <Table.Cell><InlineObject object={spec.securityContext} recurseFields={["seLinuxOptions"]}/></Table.Cell>
        </Table.Row>,
    );
    rows.push(spec.imagePullSecrets &&
        <Table.Row>
            <Table.Cell verticalAlign="top" textAlign="right">Image pull secrets</Table.Cell>
            <Table.Cell>{spec.imagePullSecrets.map( (x) => x.name ).join(", ")}</Table.Cell>
        </Table.Row>,
    );
    rows.push(spec.hostname && (
        <Table.Row>
            <Table.Cell textAlign="right">Hostname</Table.Cell>
            <Table.Cell>{spec.hostname}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.subdomain && (
        <Table.Row>
            <Table.Cell textAlign="right">Sub domain</Table.Cell>
            <Table.Cell>{spec.subdomain}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.schedulerName && (
        <Table.Row>
            <Table.Cell textAlign="right">Scheduler</Table.Cell>
            <Table.Cell>{spec.schedulerName}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.priorityClassName && (
        <Table.Row>
            <Table.Cell textAlign="right">Priority class</Table.Cell>
            <Table.Cell>{spec.priorityClassName}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.priority !== undefined && (
        <Table.Row>
            <Table.Cell textAlign="right">Priority</Table.Cell>
            <Table.Cell>{spec.priority}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.affinity && (
        <Table.Row>
            <Table.Cell textAlign="right">Affinity</Table.Cell>
            <Table.Cell>{renderAffinity(spec.affinity)}</Table.Cell>
        </Table.Row>
    ));
    return (
        <Table basic="very" celled collapsing compact>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    );
};

export class Pod extends React.Component<IPodProps, {}> {
    public render() {
        const spec = this.props.spec;
        const pod = [];
        pod.push(
            <Segment raised>
                <h2>Attributes</h2>
                {renderSpecAttributes(spec)}
            </Segment>,
        );
        pod.push(
            <Segment raised>
                <h2>Volumes</h2>
                <Volumes volumes={spec.volumes} />
            </Segment>,
        );
        const containers = [];
        (spec.initContainers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Init container: {c.name}</h3>
                    <Container spec={c} />
                </React.Fragment>,
            );
        });
        (spec.containers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Container: {c.name}</h3>
                    <Container spec={c}/>
                </React.Fragment>,
            );
        });
        pod.push(
            <React.Fragment>
                <Segment raised>
                    <h2>Containers</h2>
                    {containers}
                </Segment>
            </React.Fragment>,
        );
        return <React.Fragment>{pod}</React.Fragment>;
    }
}
