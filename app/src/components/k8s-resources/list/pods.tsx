import {genericListForResource} from "./generic-list";

const cols = [
    {
        Header: "Ready",
        accessor: "derived.ready",
        id: "ready",
        sortable: false,
        width: 60,
    },
    {
        Header: "Status",
        accessor: "derived.status",
        id: "status",
        width: 80,
    },
    {
        Header: "Restarts",
        accessor: "derived.restarts",
        headerStyle: {textAlign: "right"},
        id: "restarts",
        style: {textAlign: "right"},
        width: 80,
    },
    {
        Header: "IP",
        accessor: "derived.ip",
        id: "ip",
    },
    {
        Header: "Node",
        accessor: "derived.nodeName",
        id: "node",
    },
];

export const PodList = genericListForResource(cols);
