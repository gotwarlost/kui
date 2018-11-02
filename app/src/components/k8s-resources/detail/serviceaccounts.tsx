import * as React from "react";
import {List, Table} from "semantic-ui-react";
import {DetailUI} from "./detail-ui";
import {ObjectLink} from "./common/object-link";
import {StandardResourceTypes} from "../../../util";

const secretLink = (secret, currentNs) => {
    const name = (secret || {}).name;
    const ns = (secret.namespace || currentNs);
    return (
        <ObjectLink namespace={ns} name={name} type={StandardResourceTypes.SECRET}>
            {name}
        </ObjectLink>
    );
};

const secretListItem = (secret, currentNs) => {
   return (
       <List.Item>
           {secretLink(secret, currentNs)}
       </List.Item>
   );
};

const render = (item, component): React.ReactNode => {
    const rows = [];
    let autoMount = true;
    if (typeof item.automountServiceAccountToken !== "undefined") {
        autoMount = item.automountServiceAccountToken;
    }
    rows.push(item.secrets && item.secrets.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Secrets</Table.Cell>
            <Table.Cell>
                <List>
                    {item.secrets.map( (x) => secretListItem(x, item.metadata.namespace))}
                </List>
            </Table.Cell>
        </Table.Row>
    ));
    rows.push(item.imagePullSecrets && item.imagePullSecrets.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Image pull secrets</Table.Cell>
            <List>
                {item.imagePullSecrets.map( (x) => secretListItem(x, item.metadata.namespace))}
            </List>
        </Table.Row>
    ));
    rows.push(
        <Table.Row>
            <Table.Cell textAlign="right">Automount account token</Table.Cell>
            <Table.Cell>{autoMount ? "yes" : "no"}</Table.Cell>
        </Table.Row>,
    );
    return (
        <React.Fragment>
            <h2>Attributes</h2>
            <Table basic="very" celled collapsing>{rows}</Table>
        </React.Fragment>
    );
};

export class ServiceAccountDetailUI extends DetailUI {
    constructor(props, state) {
        super(props, state);
    }

    protected renderContent(item) {
        return render(item, this);
    }
}
