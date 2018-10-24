import {ListUI} from "./list-ui";

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

export class DaemonSetListUI extends ListUI {
    constructor(props, state) {
        super(props, state);
        this.cols = cols;
    }
}
