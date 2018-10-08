import * as React from "react";
import {Segment} from "semantic-ui-react";
import {Table} from "semantic-ui-react";
import {Container} from "./container-ui";
import {Volumes} from "./volumes-ui";

interface IPodProps {
    spec: any;
    status: any;
}

export class Pod extends React.Component<IPodProps, {}> {
    public render() {
        const spec = this.props.spec;
        const pod = [];
        pod.push(
            <Segment raised>
                <h2>Volumes</h2>
                <Volumes volumes={spec.volumes} />
            </Segment>,
        );
        const containers = [];
        (spec.initContainers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Init container: {c.name}</h3>
                    <Container spec={c} />
                </React.Fragment>,
            );
        });
        (spec.containers || []).forEach((c) => {
            containers.push(
                <React.Fragment key={c.name}>
                    <h3>Container: {c.name}</h3>
                    <Container spec={c}/>
                </React.Fragment>,
            );
        });
        pod.push(
            <React.Fragment>
                <Segment raised>
                    <h2>Containers</h2>
                    {containers}
                </Segment>
            </React.Fragment>,
        );
        return <React.Fragment>{pod}</React.Fragment>;
    }
}
