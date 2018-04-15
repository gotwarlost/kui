import * as React from "react";
import {connect} from "react-redux";
import {Dropdown} from "semantic-ui-react";
import {ActionFactory} from "../model/actions";
import {State} from "../model/state";

interface IContextListProps {
    items: string[];
    currentValue: string;
}

interface IContextListEvents {
    onSelect(event: any, data: { value: string });
}

interface IContextList extends IContextListProps, IContextListEvents {
}

class ContextListUI extends React.Component<IContextList, {}> {
    public render() {
        const listItems = this.props.items.map((name) => {
            return {key: name, text: name, value: name};
        });
        return (
            <Dropdown
                value={this.props.currentValue}
                placeholder="select cluster"
                options={listItems}
                onChange={this.props.onSelect}
                button search selection
            />
        );
    }
}

export const ContextList = connect(
    (s: State): IContextListProps => {
        return {
            currentValue: s.selection.context || "",
            items: s.availableContexts,
        };
    },
    (dispatch): IContextListEvents => {
        return {
            onSelect: (evt, data) => {
                dispatch(ActionFactory.selectContext(data.value));
            },
        };
    },
)(ContextListUI);
