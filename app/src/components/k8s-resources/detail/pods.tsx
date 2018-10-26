import * as React from "react";
import {Pod} from "./pods/pod-ui";
import {DetailUI} from "./detail-ui";

const render = (item): React.ReactNode => {
    const pod = new Pod({
        namespace: item.metadata.namespace,
        spec: item.spec,
        status: item.status});
    return pod.render();
};

export class PodDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
        this.provider = render;
    }
}
