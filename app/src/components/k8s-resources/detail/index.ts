import * as React from "react";
import {ConfigMapDetail} from "./configmaps";
import {createDetailElement} from "./generic-detail";
import {PodDetail} from "./pods";
import {ResourceQuotaDetail} from "./resourcequotas";
import {ClusterRoleDetail, RoleDetail} from "./roles";
import {SecretDetail} from "./secrets";

const pageMap = {
    clusterroles: ClusterRoleDetail,
    configmaps: ConfigMapDetail,
    pods: PodDetail,
    resourcequotas: ResourceQuotaDetail,
    roles: RoleDetail,
    secrets: SecretDetail,
};

export const detailFor = (name: string): React.ReactNode => {
    const clz = pageMap[name];
    if (!clz) {
        return createDetailElement(name);
    }
    return React.createElement(clz, {key: name}, null);
};
