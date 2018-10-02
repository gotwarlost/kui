import * as React from "react";
import {Segment} from "semantic-ui-react";
import {genericDetailForResource} from "./generic-detail";

export const ConfigMapDetail = genericDetailForResource("configmaps",
    (item): React.ReactNode => {
        const data = (item as any).data as object || {};
        const keys = Object.keys(data).sort();
        const items = keys.map((key) => {
            const value = data[key];
            return (
                <Segment raised key={key}>
                    <h4>{key}</h4>
                    <pre className="wrapped">
                        {value}
                    </pre>
                </Segment>
            );
        });
        return (
            <React.Fragment>
                <h3>Configuration data</h3>
                {items.length ? items : <div>No data found</div>}
            </React.Fragment>
        );
    },
);
