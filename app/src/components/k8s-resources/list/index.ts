import * as React from "react";
import {DaemonSetList} from "./daemonsets";
import {DeploymentList} from "./deployments";
import {EventList} from "./events";
import {createListElement} from "./generic-list";
import {PodList} from "./pods";
import {ReplicaSetList} from "./replicasets";
import {ServiceList} from "./services";

const pageMap = {
    daemonsets: DaemonSetList,
    deployments: DeploymentList,
    events: EventList,
    pods: PodList,
    replicasets: ReplicaSetList,
    services: ServiceList,
};

export const listFor = (name: string): React.ReactNode => {
    const clz = pageMap[name];
    if (!clz) {
        return createListElement(name, {key: name});
    }
    return React.createElement(clz, {key: name}, null);
};
