import * as types from "kui-shared-types";
import {toSelectorString} from "./lib/k8s-util/index";
export type Projection = (item) => object;

interface IProjectionMap {
    [key: string]: Projection;
}

const map: IProjectionMap = {};

const genericMap = (item): types.IBaseProjection => {
    return {
        creationTimestamp: item.metadata.creationTimestamp,
        labels: item.metadata.labels || {},
        metadata: {
            name: item.metadata.name,
            namespace: item.metadata.namespace,
        },
    };
};

const selectorMap = (item): types.IBaseSelectorProjection => {
    return {
        ...genericMap(item),
        selector: toSelectorString(item.spec.selector),
    };
};

map.daemonsets = (item): types.IDaemonsetProjection => {
    const readiness = (r1): string => {
        return "" + (r1.status.numberReady || 0) + "/" + (r1.status.numberAvailable || 0);
    };

    return {
        ...selectorMap(item),
        ready: readiness(item),
    };
};

map.deployments = (item): types.IProjectedDeployment => {
    const readiness = (r1): string => {
        return "" + (r1.status.readyReplicas || 0) + "/" + (r1.spec.replicas || 0);
    };

    return {
        ...selectorMap(item),
        ready: readiness(item),
    };
};

map.events = (item): types.IEventProjection => {
    return {
        ...genericMap(item),
        count: item.count || 0,
        involvedObject: item.involvedObject,
        message: item.message || "",
        type: item.type || "",
    };
};

export interface IPodProjection extends types.IBaseProjection {
    node: string;
    status: string;
    ip: string;
    ready: string;
    restarts: number;
}

map.pods = (item): IPodProjection => {
    const readiness = (r1): string => {
        let total = 0;
        let ready = 0;
        const increment = (s) => {
            total = total + 1;
            if (s.ready) {
                ready = ready + 1;
            }
        };
        (r1.status.initContainerStatuses || []).forEach((s) => {
            increment(s);
        });
        (r1.status.containerStatuses || []).forEach((s) => {
            increment(s);
        });
        return "" + ready + "/" + total;
    };
    const restarts = (r2): number => {
        let count = 0;
        (r2.status.initContainerStatuses || []).forEach((s) => {
            count = count + s.restartCount;
        });
        (r2.status.containerStatuses || []).forEach((s) => {
            count = count + s.restartCount;
        });
        return count;
    };
    return {
        ...genericMap(item),
        ip: item.status.podIP,
        node: item.spec.nodeName,
        ready: readiness(item),
        restarts: restarts(item),
        status: item.status.phase,
    };
};

map.replicasets = (item): types.IReplicasetProjecton => {
    const readiness = (r1): string => {
        return "" + (r1.status.readyReplicas || 0) + "/" + (r1.spec.replicas || 0);
    };
    return {
        ...selectorMap(item),
        ready: readiness(item),
    };
};

map.services = (item): types.IServiceProjection => {
    const ports = (r1): string => {
        const p = r1.spec.ports || [];
        const strs = [];
        p.forEach((port) => {
            strs.push("" + port.port);
        });
        return strs.join(",");
    };
    return {
        ...selectorMap(item),
        clusterIP: item.spec.clusterIP,
        ports: ports(item),
        portsArray: item.spec.ports || [],
    };
};

export const projectionFor = (name: string): Projection => {
    const p = map[name];
    if (!p) {
        return genericMap;
    }
    return p;
};
