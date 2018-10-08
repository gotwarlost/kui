import * as React from "react";
import {Label, Popup} from "semantic-ui-react";

export interface IObjectProps {
    object: object;
    showEmptyStrings?: boolean;
    showJSONStrings?: boolean;
    maxValueLength?: number;
}

export class InlineObject extends React.Component<IObjectProps, {}> {
    public render() {
        const obj = this.props.object;

        if (!(obj && typeof obj === "object")) {
            return null;
        }
        const keys = Object.keys(obj).sort();
        const strVal = (v) => {
            if (v.toString) {
                return v.toString();
            }
            return String(v);
        };
        const valueFor = (key) => {
            const value = obj[key];
            if (value === null) {
                return <React.Fragment><i>null</i></React.Fragment>;
            } else if (value === undefined) {
                return null;
            } else if (typeof value === "string") {
                const text: string = value;
                if (text === "" && !this.props.showEmptyStrings) {
                    return null;
                }
                if (text.charAt(0) === "{" && text.charAt(text.length - 1) === "}" && !this.props.showJSONStrings) {
                    return null;
                }
                return text;
            } else if (Array.isArray(value)) {
                return value.map(strVal).join(", ");
            }
            return strVal(value);
        };

        const elements = keys.map((key) => {
            const max = this.props.maxValueLength || 40;
            let v = valueFor(key);
            if (v === null) {
                return null;
            }
            if (typeof v === "string" && v.length > max) {
                const trig = <span>{v.substring(0, 37)}{"..."}</span>;
                v = (
                    <Popup trigger={trig} wide="very">
                        {v}
                    </Popup>
                );
            }
            return (
                <span className="label-item" key={key}>
                    <Label pointing="right">{key}</Label>{v}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            );
        });

        if (elements.length === 0) {
            return null;
        }
        return (
            <React.Fragment>
                {elements}
            </React.Fragment>
        );
    }
}
