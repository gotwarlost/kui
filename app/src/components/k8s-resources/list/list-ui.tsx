import * as React from "react";
import ReactTable from "react-table";
import {Loader, Message, Segment} from "semantic-ui-react";
import {IResourceList, ResourceQueryResults} from "../../../model/types";
import {ageInWords} from "../../../util";

const PAGE_SIZE = 15;
const PAGE_SIZE_CHECK = 20;

export interface IBaseAccessors {
    getNamespaceAccessor(): any;
    getNameAccessor(): any;
}

export interface IListProps {
    listName: string;
    qr: ResourceQueryResults;
    cols?: IReactTableColumn[];
    showWhenNoResults?: boolean;
    displayNamespace: boolean;
    baseAccessors: IBaseAccessors;
}

export interface IListDispatch {
    onSelect(event: any, data: {
        namespace: string,
        resourceName: string,
        objectID: string,
    });
}

export interface IList extends IListProps, IListDispatch {
}

// subset of column definition that we use. Augment when needed.
export interface IReactTableColumn {
    Header: string;
    id: string;
    accessor?: (any);
    Cell?: (any);
    style?: object;
    headerStyle?: object;
    sortable?: boolean;
    minWidth?: number;
    width?: number;
}

export class ListUI extends React.Component<IList, {}> {
    constructor(props, state) {
        super(props, state);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        if (!this.props.qr) {
            return null;
        }
        const loading = this.props.qr.loading && (
            <span>
                &nbsp;&nbsp;
                <Loader active inline size="small"/>
            </span>
        );
        const results = this.props.qr.results as IResourceList;
        let stats: React.ReactNode = null;
        if (results && results.items) {
            stats = <span className="inline-stats">&nbsp;&nbsp;({results.items.length})</span>;
        }
        const header = (
            <h2>{this.props.listName}{loading}{stats}</h2>
        );
        const err = this.props.qr.err && (
            <Message error>
                <Message.Header>Load error</Message.Header>
                {this.props.qr.err.message}
            </Message>
        );
        let content: React.ReactNode = null;
        if (!(loading || err)) {
            const resourceList = this.props.qr.results as IResourceList;
            if (resourceList.items && resourceList.items.length > 0) {
                const pagination = resourceList.items.length > PAGE_SIZE_CHECK;
                const pageSize = resourceList.items.length > PAGE_SIZE_CHECK ? PAGE_SIZE : resourceList.items.length;
                const nameCol = this.getNameColumn();
                const ageCol = this.getAgeColumn();
                const cols = this.props.displayNamespace ?
                    [nameCol, this.getNamespaceColumn(), ageCol] :
                    [nameCol, ageCol];
                cols.push(...this.getAdditionalColumns());
                content = (
                    <ReactTable
                        className=" -highlight"
                        columns={cols}
                        data={resourceList.items}
                        showPagination={pagination}
                        showPageSizeOptions={false}
                        defaultPageSize={pageSize}
                    />
                );
            } else if (this.props.showWhenNoResults) {
                content = (
                    <Message>
                        No {this.props.listName} found
                    </Message>
                );
            }
        }
        if (content === null) {
            return null;
        }
        return (
            <Segment raised>
                {header}
                {err}
                {content}
            </Segment>
        );
    }

    protected getAdditionalColumns(): IReactTableColumn[] {
        return this.props.cols || [];
    }

    private getNameColumn(): IReactTableColumn {
        return {
            Cell: ({original, value}) => {
                return (
                    <a href="#"
                       data-namespace={original.metadata.namespace}
                       data-name={original.metadata.name}
                       data-resource={this.props.qr.query.resourceName}
                       onClick={this.onClick}
                    >
                        {value}
                    </a>
                );
            },
            Header: "Name",
            accessor: this.props.baseAccessors ? this.props.baseAccessors.getNameAccessor() : "metadata.name",
            id: "__name__",
        };
    }

    private getNamespaceColumn(): IReactTableColumn {
        return {
            Header: "Namespace",
            accessor: this.props.baseAccessors ? this.props.baseAccessors.getNamespaceAccessor() : "metadata.namespace",
            id: "__namespace__",
        };
    }

    private getAgeColumn(): IReactTableColumn {
        const that = this;
        return {
            Cell: ({original}) => original.metadata.creationTimestamp && (
                <span title={original.metadata.creationTimestamp}>
                    {that.age(original)}
                </span>
            ),
            Header: "Created",
            accessor: "metadata.creationTimestamp",
            headerStyle: {textAlign: "right"},
            id: "__age__",
            style: {textAlign: "right"},
            width: 120,
        };
    }

    private age(item: any): string {
        if (!item.metadata.creationTimestamp) {
            return "";
        }
        return ageInWords(item.metadata.creationTimestamp);
    }

    private onClick(e: React.SyntheticEvent<HTMLElement>) {
        e.preventDefault();
        if (this.props.onSelect) {
            this.props.onSelect(e, {
                namespace: e.currentTarget.getAttribute("data-namespace"),
                objectID: e.currentTarget.getAttribute("data-name"),
                resourceName: e.currentTarget.getAttribute("data-resource"),
            });
        }
    }

}
