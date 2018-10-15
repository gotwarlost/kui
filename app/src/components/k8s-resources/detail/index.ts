import * as React from "react";
import {ConfigMapDetail} from "./configmaps";
import {createDetailElement} from "./generic-detail";
import {DaemonsetDetail} from "./daemonsets";
import {DeploymentDetail} from "./deployments";
import {JobDetail} from "./jobs";
import {NodeDetail} from "./nodes";
import {PodDetail} from "./pods";
import {PrometheusRuleDetail} from "./prometheus-rules";
import {ReplicaSetDetail} from "./replicasets";
import {ResourceQuotaDetail} from "./resourcequotas";
import {ClusterRoleDetail, RoleDetail} from "./roles";
import {SecretDetail} from "./secrets";
import {ServiceAccountDetail} from "./serviceaccounts";
import {StatefulsetDetail} from "./statefulsets";

const pageMap = {
    clusterroles: ClusterRoleDetail,
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
    statefulsets: StatefulsetDetail,
};

export const detailFor = (name: string): React.ReactNode => {
    const clz = pageMap[name];
    if (!clz) {
        return createDetailElement(name);
    }
    return React.createElement(clz, {key: name}, null);
};
