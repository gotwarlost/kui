import * as React from "react";
import {List, Table} from "semantic-ui-react";
import {toSelectorString} from "../../../util";
import {InlineObject} from "./common/inline-object";
import {DetailUI} from "./detail-ui";

const getPorts = (ports)  => {
    const p = ports || [];
    const lines = p.map((port) => {
        const proto = port.protocol && (
            <React.Fragment>
                &nbsp;
                <small>
                    {"(" + port.protocol + ")"}
                </small>
            </React.Fragment>
        );
        const name = port.name ?
            (<React.Fragment><b>{"[" + port.name + "]"}</b></React.Fragment>) :
            (<i>unnamed</i>);
        const line = (
            <React.Fragment>
                {name}
                {" "}
                {port.port}
                &nbsp;&#8594;&nbsp;
                {port.targetPort}
                {proto}
            </React.Fragment>
        );
        return <List.Item>{line}</List.Item>;
    });
    return (
        <React.Fragment>
            <List>
                {lines}
            </List>
        </React.Fragment>
    );
};

const render = (item): React.ReactNode => {
    const spec = item.spec || {};
    const status = item.status || {};
    const rows = [];

    rows.push(status.loadBalancer && status.loadBalancer.ingress && status.loadBalancer.ingress.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Load balancer ingress points</Table.Cell>
            <Table.Cell>
                <List>
                    {status.loadBalancer.ingress.map( (x) => <List.Item><InlineObject object={x}/></List.Item>)}
                </List>
            </Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.type && (
        <Table.Row>
            <Table.Cell textAlign="right">Type</Table.Cell>
            <Table.Cell>{spec.type}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.selector && (
        <Table.Row>
            <Table.Cell textAlign="right">Selector</Table.Cell>
            <Table.Cell>{toSelectorString(spec.selector)}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.ports && spec.ports.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right" verticalAlign="top">Ports</Table.Cell>
            <Table.Cell>{getPorts(spec.ports)}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.clusterIP && (
        <Table.Row>
            <Table.Cell textAlign="right">Cluster IP</Table.Cell>
            <Table.Cell>{spec.clusterIP}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.externalIPs && spec.externalIPs.length > 0  && (
        <Table.Row>
            <Table.Cell textAlign="right" verticalAlign="top">External IPs</Table.Cell>
            <Table.Cell>
                <List>
                    {spec.externalIPs.map((x) => <List.Item>{x}</List.Item>)}
                </List>
            </Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.sessionAffinity && (
        <Table.Row>
            <Table.Cell textAlign="right">Session Affinity</Table.Cell>
            <Table.Cell>{spec.sessionAffinity}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.loadBalancerIP && (
        <Table.Row>
            <Table.Cell textAlign="right">Load balancer IP</Table.Cell>
            <Table.Cell>{spec.loadBalancerIP}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.loadBalancerSourceRanges && spec.loadBalancerSourceRanges.length > 0  && (
        <Table.Row>
            <Table.Cell textAlign="right" verticalAlign="top">Load balancer source ranges</Table.Cell>
            <Table.Cell>
                <List>
                    {spec.loadBalancerSourceRanges.map( (x) => <List.Item>{x}</List.Item>)}
                </List>
            </Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.externalName && (
        <Table.Row>
            <Table.Cell textAlign="right">External name</Table.Cell>
            <Table.Cell>{spec.externalName}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.externalTrafficPolicy && (
        <Table.Row>
            <Table.Cell textAlign="right">External traffic policy</Table.Cell>
            <Table.Cell>{spec.externalTrafficPolicy}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.healthCheckNodePort && spec.healthCheckNodePort > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Health check node port</Table.Cell>
            <Table.Cell>{spec.healthCheckNodePort}</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.publishNotReadyAddresses && (
        <Table.Row>
            <Table.Cell textAlign="right">Publish not-ready addresses</Table.Cell>
            <Table.Cell>yes</Table.Cell>
        </Table.Row>
    ));
    rows.push(spec.sessionAffinityConfig && spec.sessionAffinityConfig.clientIP &&
        spec.sessionAffinityConfig.clientIP.timeoutSeconds && (
        <Table.Row>
            <Table.Cell textAlign="right">Session affinity timeout</Table.Cell>
            <Table.Cell>{spec.sessionAffinityConfig.clientIP.timeoutSeconds}s</Table.Cell>
        </Table.Row>
    ));
    return (
        <React.Fragment>
            <h3>Attributes</h3>
            <Table basic="very" celled collapsing>
                {rows}
            </Table>
        </React.Fragment>
    );
};

export class ServiceDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
        this.provider = render;
    }
}
