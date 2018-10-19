import * as React from "react";
import {ConfigMapDetail} from "./configmaps";
import {BasicDetail} from "./generic-detail";
import {DaemonsetDetail} from "./daemonsets";
import {DeploymentDetail} from "./deployments";
import {JobDetail} from "./jobs";
import {NodeDetail} from "./nodes";
import {PodDetail} from "./pods";
import {PrometheusRuleDetail} from "./prometheus-rules";
import {ReplicaSetDetail} from "./replicasets";
import {ResourceQuotaDetail} from "./resourcequotas";
import {RoleDetail} from "./roles";
import {SecretDetail} from "./secrets";
import {ServiceAccountDetail} from "./serviceaccounts";
import {ServiceDetail} from "./services";
import {StatefulsetDetail} from "./statefulsets";

const pageMap = {
    clusterroles: RoleDetail,
    configmaps: ConfigMapDetail,
    daemonsets: DaemonsetDetail,
    deployments: DeploymentDetail,
    jobs: JobDetail,
    nodes: NodeDetail,
    pods: PodDetail,
    prometheusrules: PrometheusRuleDetail,
    replicasets: ReplicaSetDetail,
    resourcequotas: ResourceQuotaDetail,
    roles: RoleDetail,
    secrets: SecretDetail,
    serviceaccounts: ServiceAccountDetail,
    services: ServiceDetail,
    statefulsets: StatefulsetDetail,
};

export const detailFor = (name: string): React.ReactNode => {
    const clz = pageMap[name];
    if (!clz) {
        return React.createElement(BasicDetail, {key: name, name }, null);
    }
    return React.createElement(clz, {key: name, name}, null);
};
