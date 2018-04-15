import * as React from "react";
import {genericDetailForResource} from "./generic-detail";
import {Pod} from "./pod-ui";

export const PodDetail = genericDetailForResource(
    "pods",
    (item): React.ReactNode => {
        const pod = new Pod({spec: item.spec, status: item.status});
        return pod.render();
    },
);
