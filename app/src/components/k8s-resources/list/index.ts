import * as React from "react";
import {DaemonSetList} from "./daemonsets";
import {DeploymentList} from "./deployments";
import {EventList} from "./events";
import {createListElement} from "./generic-list";
import {NodeList} from "./nodes";
import {PodList} from "./pods";
import {ReplicaSetList} from "./replicasets";
import {ServiceList} from "./services";

const pageMap = {
    daemonsets: DaemonSetList,
    deployments: DeploymentList,
    events: EventList,
    nodes: NodeList,
    pods: PodList,
    replicasets: ReplicaSetList,
    services: ServiceList,
};

export const listFor = (name: string): React.ReactNode => {
    const clz = pageMap[name];
    if (!clz) {
        return createListElement({key: name, name}, null);
    }
    return React.createElement(clz, {key: name, name}, null);
};
