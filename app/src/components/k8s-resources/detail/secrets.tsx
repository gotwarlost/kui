import * as React from "react";
import {Checkbox, Segment} from "semantic-ui-react";
import {genericDetailForResource} from "./generic-detail";

export const SecretDetail = genericDetailForResource(
    "secrets",
    (item, component): React.ReactNode => {
        const secretState = component.state || {showSecrets: false};
        const t = (item as any).type;
        const data = (item as any).data as object || {};
        const keys = Object.keys(data).sort();
        const items = keys.map((key) => {
            return !secretState.showSecrets ? <h4>{key}</h4> : (
                <Segment raised key={key}>
                    <h4>{key}</h4>
                    <pre className="wrapped">{Buffer.from(data[key], "base64").toString()}</pre>
                </Segment>
            );
        });
        const toggleReveal = (e, d) => {
            component.setState({showSecrets: d.checked});
        };
        const reveal = (items.length > 0 && (
            <Checkbox toggle onChange={toggleReveal} label="Reveal secret values"/>
        ));
        return (
            <React.Fragment>
                <h3>Secrets <small>({t})</small></h3>
                {reveal}
                {items.length ? items : <div>No data found</div>}
            </React.Fragment>
        );
    },
);
