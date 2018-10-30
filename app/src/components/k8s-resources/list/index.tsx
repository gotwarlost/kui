import * as React from "react";
import {versionlessResourceType} from "../../../util";
import {DaemonSetListUI} from "./daemonsets";
import {DeploymentListUI} from "./deployments";
import {EventsListUI} from "./events";
import {ListUI} from "./list-ui";
import {NodeListUI} from "./nodes";
import {PodListUI} from "./pods";
import {ReplicaSetListUI} from "./replicasets";
import {ServiceListUI} from "./services";
import {ErrorBoundary} from "../../error-boundary";
import {IList} from "./list-ui";

const pageMap = {
    "/:Event": EventsListUI,
    "/:Node": NodeListUI,
    "/:Pod": PodListUI,
    "/:Service": ServiceListUI,
    "apps/:DaemonSet": DaemonSetListUI,
    "apps/:Deployment": DeploymentListUI,
    "apps/:ReplicaSet": ReplicaSetListUI,
    "extensions/:DaemonSet": DaemonSetListUI,
    "extensions/:Deployment": DeploymentListUI,
    "extensions/:ReplicaSet": ReplicaSetListUI,
};

export const renderList = (resourceType: string, props: IList): React.ReactNode => {
    const key = versionlessResourceType(resourceType);
    const clz = pageMap[key] || ListUI;
    const child = React.createElement(clz, {key, ...props}, null);
    return (
        <ErrorBoundary>
            <React.Fragment>
                {child}
            </React.Fragment>
        </ErrorBoundary>
    );
};
