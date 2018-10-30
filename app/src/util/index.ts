import * as moment from "moment";
import {IResourceInfo} from "../model/types";

export const ageInWords = (dateStr: string): string => moment(dateStr).fromNow(true);

export function versionlessResourceType(name: string): string {
    const parts = name.split(":");
    const rv = parts[0];
    const kind = parts[1];
    const rvParts = rv.split("/");
    const g = rvParts.length === 1 ? "" : rvParts[0];
    return g === "" ? kind : g + ":" + kind;
}

export enum StandardResourceTypes {
    CONFIG_MAP = "ConfigMap",
    DAEMONSET = "apps:Daemonset",
    DEPLOYMENT = "apps:Deployment",
    EVENT = "Event",
    NODE = "Node",
    POD = "Pod",
    REPLICA_SET = "apps:ReplicaSet",
    SECRET = "Secret",
    SERVICE = "Service",
    STATEFUL_SET = "extensions:StatefulSet",
}

export function collectionName(x: IResourceInfo): string {
    if (!x) {
        return "";
    }
    return x.displayGroup === "" ? x.pluralName : x.pluralName + " (" + x.displayGroup + ")";
}

export function toSelectorString(selector): string {
    if (!selector) {
        return "false (does not match anything)";
    }
    const expressions = [];
    if (typeof selector !== "object") {
        return "<invalid: selector not object>";
    }
    const setBased = (selector.matchLabels && typeof selector.matchLabels === "object") ||
        (selector.matchExpressions && typeof selector.matchLabel === "object");

    const addEquality = (obj) => {
        Object.keys(obj || {}).forEach((k) => {
            expressions.push(`${k} = ${obj[k]}`);
        });
    };

    if (setBased) {
        addEquality(selector.matchLabels);
        const arr = selector.matchExpressions;
        if (arr && arr instanceof Array) {
            arr.forEach((obj) => {
                const key = obj.key || "__unknown__";
                const values = (obj.values || []).join(", ");
                const op = obj.operator;
                switch (op) {
                    case "In":
                        expressions.push(`${key} in ${values}`);
                        break;
                    case "NotIn":
                        expressions.push(`${key} not in ${values}`);
                        break;
                    case "Exists":
                        expressions.push(key);
                        break;
                    case "DoesNotExist":
                        expressions.push("!" + key);
                        break;
                    default:
                        expressions.push("<unknown expression>");
                }
            });
        }
    } else {
        addEquality(selector);
    }

    if (expressions.length === 0) {
        return "true (matches everything)";
    }
    return expressions.join(", ");
}
