import * as React from "react";
import {genericDetailForResource} from "./generic-detail";

export const SecretDetail = genericDetailForResource(
    "secrets",
    (item): React.ReactNode => {
        const t = (item as any).type;
        const data = (item as any).data as object || {};
        const keys = Object.keys(data).sort();
        const typeLine = t && <h3>Type: {t}</h3>;
        const items = keys.map((key) => {
            const value = Buffer.from(data[key], "base64").toString();
            return (
                <div key={key}>
                    <h4>{key}</h4>
                    <pre className="wrapped">
                        {value}
                    </pre>
                </div>
            );
        });
        return (
            <React.Fragment>
                {typeLine}
                <h3>Data</h3>
                {items.length ? items : <div>No data found</div>}
            </React.Fragment>
        );
    },
);
