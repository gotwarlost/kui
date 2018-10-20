import * as React from "react";
import {resourceTypeToKey} from "../../../util";
import {DaemonSetList} from "./daemonsets";
import {DeploymentList} from "./deployments";
import {EventList} from "./events";
import {BasicList} from "./generic-list";
import {NodeList} from "./nodes";
import {PodList} from "./pods";
import {ReplicaSetList} from "./replicasets";
import {ServiceList} from "./services";

const pageMap = {
    "/Event": EventList,
    "/Node": NodeList,
    "/Pod": PodList,
    "/Service": ServiceList,
    "apps/DaemonSet": DaemonSetList,
    "apps/Deployment": DeploymentList,
    "apps/ReplicaSet": ReplicaSetList,
    "extensions/DaemonSet": DaemonSetList,
    "extensions/Deployment": DeploymentList,
    "extensions/ReplicaSet": ReplicaSetList,
};

export const listFor = (name: string): React.ReactNode => {
    const key = resourceTypeToKey(name);
    const clz = pageMap[key];
    if (!clz) {
        return React.createElement(BasicList, {key: name, name}, null);
    }
    return React.createElement(clz, {key: name, name}, null);
};
