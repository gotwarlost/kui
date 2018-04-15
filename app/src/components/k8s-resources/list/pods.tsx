import {genericListForResource} from "./generic-list";

const cols = [
    {
        Header: "Ready",
        accessor: "ready",
        id: "ready",
        sortable: false,
        width: 60,
    },
    {
        Header: "Status",
        accessor: "status",
        id: "status",
        width: 80,
    },
    {
        Header: "Restarts",
        accessor: "restarts",
        headerStyle: {textAlign: "right"},
        id: "restarts",
        style: {textAlign: "right"},
        width: 80,
    },
    {
        Header: "IP",
        accessor: "ip",
        id: "ip",
    },
    {
        Header: "Node",
        accessor: "node",
        id: "node",
    },
];

export const PodList = genericListForResource("pods", cols);
