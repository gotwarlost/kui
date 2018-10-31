import * as React from "react";
import {List} from "semantic-ui-react";
import {DetailUI} from "./detail-ui";
import {ObjectLink} from "./common/object-link";
import ReactTable from "react-table";

const shallowCopy = (obj) => {
    const ret = {};
    Object.keys(obj).forEach( (k) => {
        ret[k] = obj[k];
    });
    return ret;
};

const renderEndpoints = (subset): React.ReactNode => {
    const addresses = (subset.addresses || []).map( (addr) => {
        const ret = shallowCopy(addr);
        (ret as any).ready = "Ready";
        return ret;
    });
    const nrAddresses = (subset.notReadyAddresses || []).map( (addr) => {
        const ret = shallowCopy(addr);
        (ret as any).ready = "Not Ready";
        return ret;
    });
    nrAddresses.push(...addresses);
    const targetAccessor = ({original, value}) => {
        return (
            <ObjectLink type={value.apiVersion + ":" + value.kind}
                        name={value.name}
                        namespace={value.namespace}>
                {original.targetRef.kind}&nbsp;&nbsp;{value.name}
            </ObjectLink>
        );
    };
    const cols = [
        {
            Header: "IP",
            accessor: "ip",
            id: "ip",
        },
        {
            Cell: targetAccessor,
            Header: "Target",
            accessor: "targetRef",
            id: "target",
        },
        {
            Header: "Ready",
            accessor: "ready",
            id: "ready",
        },
        {
            Header: "Hostname",
            accessor: "hostname",
            id: "hostname",
        },
        {
            Header: "Node name",
            accessor: "nodeName",
            id: "nodeName",
        },
    ];
    const maxPageSize = 10;
    const pageSize = nrAddresses.length > maxPageSize ? maxPageSize : nrAddresses.length;
    const showPagination = nrAddresses.length > maxPageSize;
    return <ReactTable
        className=" -highlight"
        columns={cols}
        data={nrAddresses}
        showPageSizeOptions={false}
        defaultPageSize={pageSize}
        showPagination={showPagination}
    />;
};

const renderSubset = (subset): React.ReactNode => {
    const ports = (subset.ports || []).map( (port) => {
        const name = !port.name ? null : <React.Fragment>&nbsp;&nbsp;{port.name}</React.Fragment>;
        const proto = !port.protocol ? null : <React.Fragment>&nbsp;&nbsp;({port.protocol})</React.Fragment>;
        return (
            <List.Item>
                {port.port}
                {name}
                {proto}
            </List.Item>
        );
    });
    return (
        <React.Fragment>
            <h3>Ports</h3>
            <List>
            {ports}
            </List>
            {renderEndpoints(subset)}
        </React.Fragment>
    );
};

const render = (item, component): React.ReactNode => {
    if (!(item.subsets && item.subsets.length)) {
        return null;
    }
    if (item.subsets.length === 1) {
        return renderSubset(item.subsets[0]);
    }
    let count = 0;
    const subsets = item.subsets.map( (subset) => {
        count++;
        return (
            <React.Fragment>
                <h3>Subset #{count}</h3>
                {renderSubset(subset)}
            </React.Fragment>
        );
    });
    return (
        <React.Fragment>
            {subsets}
        </React.Fragment>
    );
};

export class EndpointsDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
    }

    protected renderContent(item) {
        return render(item, this);
    }
}
