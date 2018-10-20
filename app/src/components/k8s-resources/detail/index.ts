import * as React from "react";
import {resourceTypeToKey} from "../../../util";
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
    "/ConfigMap": ConfigMapDetail,
    "/Node": NodeDetail,
    "/Pod": PodDetail,
    "/ResourceQuota": ResourceQuotaDetail,
    "/Secret": SecretDetail,
    "/Service": ServiceDetail,
    "/ServiceAccount": ServiceAccountDetail,
    "apps/DaemonSet": DaemonsetDetail,
    "apps/Deployment": DeploymentDetail,
    "apps/ReplicaSet": ReplicaSetDetail,
    "apps/StatefulSet": StatefulsetDetail,
    "batch/Job": JobDetail,
    "extensions/DaemonSet": DaemonsetDetail,
    "extensions/Deployment": DeploymentDetail,
    "extensions/ReplicaSet": ReplicaSetDetail,
    "extensions/StatefulSet": StatefulsetDetail,
    "monitoring.coreos.com/PrometheusRule": PrometheusRuleDetail,
    "rbac.authorization.k8s.io/ClusterRole": RoleDetail,
    "rbac.authorization.k8s.io/Role": RoleDetail,
};

export const detailFor = (name: string): React.ReactNode => {
    const key = resourceTypeToKey(name);
    const clz = pageMap[key];
    if (!clz) {
        return React.createElement(BasicDetail, {key: name, name }, null);
    }
    return React.createElement(clz, {key: name, name}, null);
};
