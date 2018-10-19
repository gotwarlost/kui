import { genericListForResource } from "./generic-list";

const cols = [
    {
        Header: "Status",
        accessor: "derived.status",
        id: "ready",
    },
    {
        Header: "Roles",
        accessor: "derived.roles",
        id: "roles",
    },
    {
        Header: "Version",
        accessor: "derived.kubeletVersion",
        id: "kubeletVersion",
    },
    {
        Header: "Pod CIDR",
        accessor: "derived.podCIDR",
        id: "podCIDR",
    },
    {
        Header: "External ID",
        accessor: "derived.externalID",
        id: "externalID",
    },
];

export const NodeList = genericListForResource(cols);
