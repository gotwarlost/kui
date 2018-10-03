import * as React from "react";
import {Table} from "semantic-ui-react";
import {renderObject} from "./metadata-detail-ui";

const formatArgs = (args: string[]): string => {
    const ret = [];
    args.forEach((arg) => {
        if (arg.length === 0 || arg.indexOf(" ") >= 0 || arg.indexOf("'") >= 0) {
            ret.push('"' + arg + '"');
        } else if (arg.indexOf('"') >= 0) {
            ret.push("'" + arg + "'");
        } else {
            ret.push(arg);
        }
    });
    return ret.join("  ");
};

const formatPorts = (ports: any[]): React.ReactNode => {
    let count = 0;
    const lines = [];
    ports.forEach((port) => {
        const prefix = count === 0 ? null : <br/>;
        count++;
        const proto = port.protocol && (
            <React.Fragment>
                &nbsp;
                <small>
                    {"(" + port.protocol + ")"}
                </small>
            </React.Fragment>
        );
        const name = port.name && <b>{"[" + port.name + "]"}</b>;
        const host = (port.hostIP || port.hostPort) &&
            (<React.Fragment>&nbsp;&nbsp;(host: {port.hostIP} {port.hostPort})</React.Fragment>);
        const line = (
            <React.Fragment>
                {prefix}
                {name}
                {" "}
                {port.containerPort}
                {proto}
                {host}
            </React.Fragment>
        );
        lines.push(line);
    });
    return <React.Fragment>{lines}</React.Fragment>;
};

const formatEnv = (env: any[]): React.ReactNode => {
    const rows = [];
    env.forEach((e) => {
        let cell = e.value;
        if (e.valueFrom) {
            const vf = e.valueFrom;
            if (vf.fieldRef) {
                cell = <React.Fragment><i>from field </i> {vf.fieldRef.fieldPath}</React.Fragment>;
            } else if (vf.resourceFieldRef) {
                let extra;
                if (vf.fieldRef.container) {
                    extra = <React.Fragment>container={vf.fieldRef.container}&nbsp;</React.Fragment>;
                }
                if (vf.fieldRef.divisor) {
                    extra = <React.Fragment>divisor={vf.fieldRef.divisor}&nbsp;</React.Fragment>;
                }
                cell = <React.Fragment><i>from resource </i> {vf.fieldRef.resource} {extra}</React.Fragment>;
            } else if (vf.configMapKeyRef) {
                const base = vf.configMapKeyRef;
                cell = (
                    <React.Fragment>
                        <i>from configmap </i>
                        {base.name},
                        key={base.key}
                        {base.optional ? ", optional" : ""}
                    </React.Fragment>
                );
            } else if (vf.secretKeyRef) {
                const base = vf.secretKeyRef;
                cell = (
                    <React.Fragment>
                        <i>from secret </i>
                        {base.name},
                        key={base.key}
                        {base.optional ? ", optional" : ""}
                    </React.Fragment>
                );
            } else {
                cell = <i>Unknown env reference</i>;
            }
        }
        rows.push(
            <Table.Row>
                <Table.Cell textAlign="right">{e.name}</Table.Cell>
                <Table.Cell>{cell}</Table.Cell>
            </Table.Row>,
        );
    });
    return (
        <Table basic="very" collapsing compact>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    );
};

const  formatEnvSource = (e): React.ReactNode  => {
    let base;
    let source;
    let name;
    let prefix;
    let opt;
    if (e.configMapKeyRef) {
        source = "config map";
        base = e.configMapKeyRef;
    } else if (e.secretKeyRef) {
        source = "secret";
        base = e.secretKeyRef;
    } else {
        source = "unknown source";
    }
    if (base) {
        name = base.name;
        prefix = base.prefix && <React.Fragment>, prefix {base.prefix}</React.Fragment>;
        opt = base.optional ? ", optional" : "";
    }
    return (
        <Table.Row>
            <Table.Cell textAlign="right">Env from {source}</Table.Cell>
            <Table.Cell>{name}{prefix}{opt}</Table.Cell>
        </Table.Row>
    );
};

const formatResources = (res): React.ReactNode => {
    const lines = [];
    lines.push(res.requests && (
        <React.Fragment>
            <i>Request</i>&nbsp;&nbsp;
            {renderObject(res.requests)}
        </React.Fragment>
    ));
    lines.push(res.limits && (
        <React.Fragment>
            <i>Limit</i>&nbsp;&nbsp;
            {renderObject(res.limits)}
        </React.Fragment>
    ));
    return <React.Fragment>{lines}</React.Fragment>;
};

const formatMounts = (mounts: any[]): React.ReactNode => {
    const rows = mounts.map( (mount) => {
        const suffix = mount.subPath ? <React.Fragment>&nbsp;sub path: {mount.subPath}&nbsp;</React.Fragment> : "";
        const suffix2 = mount.readOnly ? <React.Fragment>&nbsp;<i>read only</i>&nbsp;</React.Fragment> : "";
        return (
            <Table.Row>
                <Table.Cell>{mount.name}</Table.Cell>
                <Table.Cell><code>{mount.mountPath}</code></Table.Cell>
                <Table.Cell>
                    {suffix}
                    {suffix2}
                </Table.Cell>
            </Table.Row>
        );
    });
    return <Table basic="very" collapsing compact>{rows}</Table>;
};

interface IContainerProps {
    spec: any;
    status?: any;
}

class Container extends React.Component<IContainerProps, {}> {
    public render() {
        const spec = this.props.spec;
        const rows = [];
        rows.push((
            <Table.Row key="image">
                <Table.Cell textAlign="right">Image</Table.Cell>
                <Table.Cell>{spec.image}</Table.Cell>
            </Table.Row>
        ));
        rows.push(spec.command && spec.command.length && (
            <Table.Row>
                <Table.Cell textAlign="right">Command</Table.Cell>
                <Table.Cell>{formatArgs(spec.command)}</Table.Cell>
            </Table.Row>
        ));
        rows.push(spec.args && spec.args.length && (
            <Table.Row>
                <Table.Cell textAlign="right">Args</Table.Cell>
                <Table.Cell>{formatArgs(spec.args)}</Table.Cell>
            </Table.Row>
        ));
        rows.push(spec.workingDir && (
            <Table.Row>
                <Table.Cell textAlign="right">Working dir</Table.Cell>
                <Table.Cell>{spec.workingDir}</Table.Cell>
            </Table.Row>
        ));
        rows.push(spec.ports && spec.ports.length && (
            <Table.Row>
                <Table.Cell textAlign="right">Ports</Table.Cell>
                <Table.Cell>{formatPorts(spec.ports)}</Table.Cell>
            </Table.Row>
        ));
        rows.push(spec.env && spec.env.length && (
            <Table.Row>
                <Table.Cell textAlign="right">Environment</Table.Cell>
                <Table.Cell>{formatEnv(spec.env)}</Table.Cell>
            </Table.Row>
        ));
        if (spec.envFrom && spec.envFrom.length) {
            spec.envFrom.forEach( (e) => {
                rows.push(formatEnvSource(e));
            });
        }
        if (spec.resources && (spec.resources.requests || spec.resources.limits)) {
            rows.push(
                <Table.Row>
                    <Table.Cell textAlign="right">Resources</Table.Cell>
                    <Table.Cell>{formatResources(spec.resources)}</Table.Cell>
                </Table.Row>,
            );
        }
        rows.push(spec.volumeMounts && spec.volumeMounts.length &&
            <Table.Row>
                <Table.Cell textAlign="right">Volume mounts</Table.Cell>
                <Table.Cell>{formatMounts(spec.volumeMounts)}</Table.Cell>
            </Table.Row>,
        );
        return (
            <Table basic="very" celled collapsing compact>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        );
    }
}

interface IPodProps {
    spec: any;
    status: any;
}

export class Pod extends React.Component<IPodProps, {}> {
    public render() {
        const spec = this.props.spec;
        const containers = [];
        (spec.containers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Container: {c.name}</h3>
                    <Container spec={c}/>
                </React.Fragment>,
            );
        });
        return <React.Fragment>{containers}</React.Fragment>;
    }
}
