import * as moment from "moment";

export const ageInWords = (dateStr: string): string => moment(dateStr).fromNow(true);

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
