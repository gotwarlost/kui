import { genericListForResource } from "./generic-list";

const cols = [
    {
        Header: "Kind",
        accessor: "involvedObject.kind",
        id: "kind",
    },
    {
        Header: "Type",
        accessor: "type",
        id: "type",
    },
    {
        Header: "Message",
        accessor: "message",
        id: "message",
    },
    {
        Header: "Count",
        accessor: "count",
        id: "count",
    },
];

class Accessors {
    public getNamespaceAccessor() {
        return (rec) => {
            if (rec.involvedObject && rec.involvedObject.namespace) {
                return rec.involvedObject.namespace;
            }
            return rec.namespace;
        };
    }
    public getNameAccessor() {
        return (rec) => {
            if (rec.involvedObject && rec.involvedObject.name) {
                return rec.involvedObject.name;
            }
            return rec.name;
        };
    }
}

export const EventList = genericListForResource(cols, new Accessors());
