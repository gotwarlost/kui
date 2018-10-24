import {ListUI} from "./list-ui";

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

export class NodeListUI extends ListUI {
    constructor(props, state) {
        super(props, state);
        this.cols = cols;
    }
}
