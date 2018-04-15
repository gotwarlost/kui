
export interface IBaseMetadata {
    namespace: string;
    name: string;
}

export interface IBaseProjection {
    creationTimestamp: string;
    labels: { [key: string]: string };
    metadata: IBaseMetadata;
}

export interface IBaseSelectorProjection extends IBaseProjection {
    selector: string;
}

export interface IDaemonsetProjection extends IBaseSelectorProjection {
    ready: string;
}

export interface IProjectedDeployment extends IBaseSelectorProjection {
    ready: string;
}

export interface IEventProjection  extends IBaseProjection {
    involvedObject: object;
    type: string;
    message: string;
    count: number;
}

export interface IReplicasetProjecton extends IBaseSelectorProjection {
    ready: string;
}

export interface IServiceProjection extends IBaseSelectorProjection {
    clusterIP: string;
    ports: string;
    portsArray: any[];
}
