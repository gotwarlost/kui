import * as React from "react";
import {Segment} from "semantic-ui-react";
import {Grid, List, Table} from "semantic-ui-react";
import {ageInWords, toSelectorString} from "../../../../util";
import {InlineObject} from "../common/inline-object";
import {Container} from "./container-ui";
import {Volumes} from "./volumes-ui";
import {Conditions} from "../common/conditions";

interface IPodProps {
    namespace: string;
    spec: any;
    status?: any;
}

const tolerationString = (toleration) => {
    const v = toleration.operator === "Equal" ? "=" + toleration.value : null;
    const e = toleration.effect ? ":" + toleration.effect : null;
    const t = toleration.tolerationSeconds !== undefined ? <i>{" (" + toleration.tolerationSeconds + "s)"}</i> : null;
    return (
      <React.Fragment>
          {toleration.key}{e}{v}{t}
      </React.Fragment>
    );
};

const renderTolerations = (tolerations) => {
    const rows = tolerations.map((t) => <List.Item>{tolerationString(t)}</List.Item>);
    return <List>{rows}</List>;
};

const renderAffinity = (affinity) => {
    return <i>Affinity present but renderer not implemented. See YAML view for details</i>;
};

const renderDNSConfig = (dnsConfig) => {
    return <i>DNS config present but renderer not implemented. See YAML view for details</i>;
};

const renderSpecAttributes = (spec) => {
    if (!spec) {
        return null;
    }
    const rows = [];
    rows.push(spec.nodeName && (
        <Table.Row>
            <Table.Cell textAlign="right">Node name</Table.Cell>
            <Table.Cell>{spec.nodeName}</Table.Cell>
        </Table.Row>
    ));

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
            <Table.Cell textAlign="right">Termination grace</Table.Cell>
            <Table.Cell>{spec.terminationGracePeriodSeconds}s</Table.Cell>
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
    rows.push(spec.tolerations && spec.tolerations.length > 0 && (
       <Table.Row>
           <Table.Cell textAlign="right" verticalAlign="top">Tolerations</Table.Cell>
           <Table.Cell>{renderTolerations(spec.tolerations)}</Table.Cell>
       </Table.Row>
    ));
    rows.push(spec.dnsConfig && (
        <Table.Row>
            <Table.Cell textAlign="right">DNS config</Table.Cell>
            <Table.Cell>{renderDNSConfig(spec.dnsConfig)}</Table.Cell>
        </Table.Row>
    ));

    return (
        <Table celled collapsing>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    );
};

const getBasicStatus = (status) => {
    const rows = [];
    const phase = status.phase || null;
    const msg = !status.message ? null : (
        <React.Fragment>
            &nbsp;&nbsp;( {status.message} )
        </React.Fragment>
    );
    const start = !status.startTime ? null : (
        <React.Fragment>
            ,&nbsp;&nbsp;
            started {ageInWords(status.startTime)} (<small>{status.startTime}</small>)
        </React.Fragment>
    );
    if (phase || msg || start) {
        rows.push(
            <Table.Row>
                <Table.Cell textAlign="right">Phase</Table.Cell>
                <Table.Cell>{phase}{msg}{start}</Table.Cell>
            </Table.Row>,
        );
    }
    rows.push(status.podIP && (
        <Table.Row>
            <Table.Cell textAlign="right">Pod IP</Table.Cell>
            <Table.Cell>{status.podIP}</Table.Cell>
        </Table.Row>
    ));
    rows.push(status.hostIP && (
        <Table.Row>
            <Table.Cell textAlign="right">Host IP</Table.Cell>
            <Table.Cell>{status.hostIP}</Table.Cell>
        </Table.Row>
    ));
    rows.push(status.nominatedNodeName && (
        <Table.Row>
            <Table.Cell textAlign="right">Nominated node name</Table.Cell>
            <Table.Cell>{status.nominatedNodeName}</Table.Cell>
        </Table.Row>
    ));
    const statusTable = rows.length === 0 ? null : (
        <React.Fragment>
            <h3>Info</h3>
            <Table celled collapsing>
                {rows}
            </Table>
        </React.Fragment>
    );
    return statusTable;
};

const getState = (state) => {
    if (!state) {
        return null;
    }
    if (state.waiting) {
        const waitMsg = !state.waiting.message ? null : (
            <React.Fragment>
                &nbsp;&nbsp;( {state.waiting.message} )
            </React.Fragment>
        );
        return (
           <React.Fragment>
               Waiting{waitMsg}
           </React.Fragment>
        );
    }
    if (state.running) {
        const started = !state.startedAt ? null : (
            <React.Fragment>
                ,&nbsp; &nbsp;
                started {ageInWords(state.startedAt)} (<small>{state.startedAt}</small>)
            </React.Fragment>
        );
        return (
            <React.Fragment>
                Running{started}
            </React.Fragment>
        );
    }
    if (state.terminated) {
        const t = state.terminated;
        return (
            <React.Fragment>
                Terminated&nbsp;&nbsp;
                <InlineObject object={{
                    exitCode: t.exitCode,
                    finishedAt: t.finishedAt,
                    message: t.message,
                    signal: t.signal,
                    startedAt: t.startedAt,
                }} />
            </React.Fragment>
        );
    }
    return "<i>Unknown</i>";
};

const getContainerStatus = (status) => {
    if (!(status.containerStatuses || status.initContainerStatuses)) {
        return null;
    }
    const rows = [];
    const addContainerStatus = (cstat, init) => {
        rows.push(
            <Table.Row>
                <Table.Cell>{init ? "Init:" : ""}{cstat.name}</Table.Cell>
                <Table.Cell>{cstat.ready ? "Yes" : "No"}</Table.Cell>
                <Table.Cell>{getState(cstat.state)}</Table.Cell>
                <Table.Cell>{cstat.restartCount}</Table.Cell>
                <Table.Cell>{getState(cstat.lastTerminationState)}</Table.Cell>
            </Table.Row>,
        );
    };

    (status.initContainerStatuses || []).forEach( (cs) => { addContainerStatus(cs, true); });
    (status.containerStatuses || []).forEach( (cs) => { addContainerStatus(cs, false); });
    return (
        <React.Fragment>
            <h3>Container status</h3>
            <Table celled collapsing>
                <Table.Header>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Ready</Table.HeaderCell>
                    <Table.HeaderCell>State</Table.HeaderCell>
                    <Table.HeaderCell>Restart count</Table.HeaderCell>
                    <Table.HeaderCell>Last termination state</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        </React.Fragment>
    );
};

const renderStatus = (status) => {
    const conds = !status.conditions ? null : <Segment><Conditions conditions={status.conditions}/></Segment>;
    return (
        <React.Fragment>
            <Grid stackable>
                <Grid.Column width={6}>
                    {getBasicStatus(status)}
                </Grid.Column>
                <Grid.Column width={10}>
                    {conds}
                </Grid.Column>
                <Grid.Column width={16}>
                    {getContainerStatus(status)}
                </Grid.Column>
            </Grid>
        </React.Fragment>
    );
};

export class Pod extends React.Component<IPodProps, {}> {
    public render() {
        const spec = this.props.spec || {};
        const status = this.props.status || {};
        const pod = [];
        if (status && Object.keys(status).length > 0) {
            pod.push(
                <Segment raised>
                    <h2>Status</h2>
                    {renderStatus(status)}
                </Segment>,
            );
        }
        pod.push(
            <Segment raised>
                <h2>Attributes</h2>
                {renderSpecAttributes(spec)}
            </Segment>,
        );
        if (spec.volumes && spec.volumes.length > 0) {
            pod.push(
                <Segment raised>
                    <h2>Volumes</h2>
                    <Volumes namespace={this.props.namespace} volumes={spec.volumes}/>
                </Segment>,
            );
        }
        const containers = [];
        (spec.initContainers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Init container: {c.name}</h3>
                    <Container spec={c} namespace={this.props.namespace}/>
                </React.Fragment>,
            );
        });
        (spec.containers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Container: {c.name}</h3>
                    <Container spec={c} namespace={this.props.namespace} />
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
