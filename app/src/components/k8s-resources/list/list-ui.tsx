import * as React from "react";
import ReactTable from "react-table";
import {Loader, Message, Segment} from "semantic-ui-react";
import {IResourceList, ResourceQueryResults} from "../../../model/types";
import {ageInWords} from "../../../util";
import {ObjectLink} from "../detail/common/object-link";

const PAGE_SIZE = 15;

export interface IBaseAccessors {
    getNamespaceAccessor(): any;
    getNameAccessor(): any;
}

export interface IList {
    listName: string;
    qr: ResourceQueryResults;
    displayNamespace: boolean;
    showWhenNoResults?: boolean;
    pageSize?: number;
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

    protected baseAccessors?: IBaseAccessors;
    protected cols?: IReactTableColumn[];

    constructor(props, state) {
        super(props, state);
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

        if (this.props.qr.err && this.props.qr.err.authzError && !this.props.showWhenNoResults) {
            return null;
        }

        const err = this.props.qr.err && (
            <Message error>
                <Message.Header>Load error</Message.Header>
                <pre className="wrapped">{this.props.qr.err.message}</pre>
            </Message>
        );
        let content: React.ReactNode = null;
        if (!(loading || err)) {
            const resourceList = this.props.qr.results as IResourceList;
            const maxPageSize = this.props.pageSize || PAGE_SIZE;
            const checkPageSize = maxPageSize + 5;
            if (resourceList.items && resourceList.items.length > 0) {
                const pagination = resourceList.items.length > checkPageSize;
                const pageSize = resourceList.items.length > checkPageSize ? maxPageSize : resourceList.items.length;
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
            if (content === null) {
                return null;
            }
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
        return this.cols || [];
    }

    private getNameColumn(): IReactTableColumn {
        return {
            Cell: ({original, value}) => {
                return (
                    <ObjectLink type={this.props.qr.query.resourceType}
                                name={original.metadata.name}
                                namespace={original.metadata.namespace}>
                        {value}
                    </ObjectLink>
                );
            },
            Header: "Name",
            accessor: this.baseAccessors ? this.baseAccessors.getNameAccessor() : "metadata.name",
            id: "__name__",
        };
    }

    private getNamespaceColumn(): IReactTableColumn {
        return {
            Header: "Namespace",
            accessor: this.baseAccessors ? this.baseAccessors.getNamespaceAccessor() : "metadata.namespace",
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
}
