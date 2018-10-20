import * as React from "react";
import {genericListForResource} from "./generic-list";

const cols = [
    {
        Header: "Selector",
        accessor: "derived.selector",
        id: "selector",
    },
    {
        Header: "Cluster IP",
        accessor: "spec.clusterIP",
        id: "clusterIP",
    },
    {
        Cell: ({original}) => portsCell(original),
        Header: "Ports",
        accessor: "ports",
        id: "ports",
        sortable: false,
    },
];

const portsCell = (item): React.ReactNode => {
    const p = (item.spec || {}).ports || [];
    const lines: React.ReactNode[] = [];
    let count = 0;
    p.forEach((port) => {
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
        const name = port.name ?
            (<React.Fragment><b>{"[" + port.name + "]"}</b></React.Fragment>) :
            (<i>unnamed</i>);
        const line = (
            <React.Fragment>
                {prefix}
                {name}
                {" "}
                {port.port}
                &nbsp;&#8594;&nbsp;
                {port.targetPort}
                {proto}
            </React.Fragment>
        );
        lines.push(line);
    });
    return <React.Fragment>{lines}</React.Fragment>;
};

export const ServiceList = genericListForResource(cols);
