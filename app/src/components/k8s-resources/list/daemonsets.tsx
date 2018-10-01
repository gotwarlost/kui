import {genericListForResource} from "./generic-list";

const cols = [
    {
        Header: "Selector",
        accessor: "derived.selector",
        id: "selector",
    },
    {
        Header: "Ready",
        accessor: "derived.ready",
        id: "ready",
        sortable: false,
        width: 100,
    },
];

export const DaemonSetList = genericListForResource("daemonsets", cols);
