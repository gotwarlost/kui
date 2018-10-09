import * as React from "react";
import {Label, Popup} from "semantic-ui-react";

export interface IObjectProps {
    object: object;
    showEmptyStrings?: boolean;
    showJSONStrings?: boolean;
    maxValueLength?: number;
    recurseFields?: string[];
}

const strVal = (v) => {
    if (v.toString) {
        return v.toString();
    }
    return String(v);
};

const valueFor = (value: any, props: IObjectProps) => {
    if (value === null) {
        return <i>null</i>;
    } else if (value === undefined) {
        return null;
    } else if (typeof value === "string") {
        const text: string = value;
        if (text === "" && !props.showEmptyStrings) {
            return null;
        }
        if (text.charAt(0) === "{" && text.charAt(text.length - 1) === "}" && !props.showJSONStrings) {
            return null;
        }
        return text;
    } else if (Array.isArray(value)) {
        return value.map(strVal).join(", ");
    }
    return strVal(value);
};

export class InlineObject extends React.Component<IObjectProps, {}> {
    public render() {
        const obj = this.props.object;

        if (!(obj && typeof obj === "object")) {
            return null;
        }
        const keys = Object.keys(obj).sort();
        const elements = [];
        const max = this.props.maxValueLength || 40;

        const addElement = (obj, key, prefix) => {
            const val = obj[key];
            let v;
            if (val && typeof val === "object") {
                v = <i>object</i>;
            } else {
                v = valueFor(val, this.props);
                if (v === null) {
                    return;
                }
            }
            const origV = v;
            if (typeof v === "string" && v.length > max) {
                const trig = <span>{v.substring(0, 37)}{"..."}</span>;
                v = (
                    <Popup trigger={trig} wide="very">
                        {v}
                    </Popup>
                );
            }
            if (typeof origV === "string" && origV.indexOf("http://") === 0 || origV.indexOf("https://") === 0) {
                v = <a target="_blank" href={origV}>{v}</a>;
            }
            elements.push(
                <span className="label-item" key={key}>
                    <Label pointing="right">{prefix}{key}</Label>{v}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            );
        };
        const fieldMap = {};
        (this.props.recurseFields || []).forEach( (x) => { fieldMap[x] = true;});

        keys.forEach((key) => {
            const val = obj[key];
            if (val && typeof val === "object" && fieldMap[key]) {
                const subKeys = Object.keys(val).sort();
                subKeys.forEach( (k) => { addElement(val, k, key + "."); });
            } else {
                addElement(obj, key, "");
            }
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
