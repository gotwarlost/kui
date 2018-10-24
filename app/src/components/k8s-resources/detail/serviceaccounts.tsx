import * as React from "react";
import {Table} from "semantic-ui-react";
import {DetailUI} from "./detail-ui";

const render = (item): React.ReactNode => {
    const rows = [];
    let autoMount = true;
    if (typeof item.automountServiceAccountToken !== "undefined") {
        autoMount = item.automountServiceAccountToken;
    }
    rows.push(item.secrets && item.secrets.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Secrets</Table.Cell>
            <Table.Cell>{item.secrets.map( (x) => x.name ).join(", ")}</Table.Cell>
        </Table.Row>
    ));
    rows.push(item.imagePullSecrets && item.imagePullSecrets.length > 0 && (
        <Table.Row>
            <Table.Cell textAlign="right">Image pull secrets</Table.Cell>
            <Table.Cell>{item.imagePullSecrets.map( (x) => x.name ).join(", ")}</Table.Cell>
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
        this.provider = render;
    }
}
