import * as React from "react";
import {versionlessResourceType} from "../../../util";
import {ConfigMapDetailUI} from "./configmaps";
import {DetailUI, IDetail} from "./detail-ui";
import {DaemonsetDetailUI} from "./daemonsets";
import {DeploymentDetailUI} from "./deployments";
import {EndpointsDetailUI} from "./endpoints";
import {JobDetailUI} from "./jobs";
import {NodeDetailUI} from "./nodes";
import {PodDetailUI} from "./pods";
import {PrometheusRuleDetailUI} from "./prometheus-rules";
import {ReplicaSetDetailUI} from "./replicasets";
import {ResourceQuotaDetailUI} from "./resourcequotas";
import {RoleDetailUI} from "./roles";
import {SecretDetailUI} from "./secrets";
import {ServiceAccountDetailUI} from "./serviceaccounts";
import {ServiceDetailUI} from "./services";
import {StatefulsetDetailUI} from "./statefulsets";

const pageMap = {
    "/:ConfigMap": ConfigMapDetailUI,
    "/:Endpoints": EndpointsDetailUI,
    "/:Node": NodeDetailUI,
    "/:Pod": PodDetailUI,
    "/:ResourceQuota": ResourceQuotaDetailUI,
    "/:Secret": SecretDetailUI,
    "/:Service": ServiceDetailUI,
    "/:ServiceAccount": ServiceAccountDetailUI,
    "apps/:DaemonSet": DaemonsetDetailUI,
    "apps/:Deployment": DeploymentDetailUI,
    "apps/:ReplicaSet": ReplicaSetDetailUI,
    "apps/:StatefulSet": StatefulsetDetailUI,
    "batch/:Job": JobDetailUI,
    "extensions/:DaemonSet": DaemonsetDetailUI,
    "extensions/:Deployment": DeploymentDetailUI,
    "extensions/:ReplicaSet": ReplicaSetDetailUI,
    "extensions/:StatefulSet": StatefulsetDetailUI,
    "monitoring.coreos.com/:PrometheusRule": PrometheusRuleDetailUI,
    "rbac.authorization.k8s.io/:ClusterRole": RoleDetailUI,
    "rbac.authorization.k8s.io/:Role": RoleDetailUI,
};

export const renderDetail = (resourceType: string, props: IDetail): React.ReactNode => {
    const key = versionlessResourceType(resourceType);
    const clz = pageMap[key] || DetailUI;
    return React.createElement(clz, {key, ...props}, null);
};
