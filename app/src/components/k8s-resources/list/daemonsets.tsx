import {genericListForResource} from "./generic-list";

const cols = [
    {
        Header: "Selector",
        accessor: "selector",
        id: "selector",
    },
    {
        Header: "Ready",
        accessor: "ready",
        id: "ready",
        sortable: false,
        width: 100,
    },
];

export const DaemonSetList = genericListForResource("daemonsets", cols);
