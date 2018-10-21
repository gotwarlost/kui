import {Client} from "../../client";
import {State, StateReader} from "../state";

export const setDoctitle = (client: Client) => ({dispatch, getState}) => (next) => (action) => {
    next(action);
    const state = getState() as State;
    const ob = StateReader.getObjectSelection(state);
    const ls = StateReader.getListPageSelection(state);
    let title = "kui";
    if (ob) {
        const info = StateReader.getResourceInfo(state, ob.resourceType);
        const rName = info && info.displayName || "";
        title = `${title}: ${rName} ${ob.name}`;
    } else if (ls) {
        if (ls.resourceTypes.length > 1) {
            title = `${title}: List overview`;
        } else if (ls.resourceTypes.length > 0) {
            const lInfo = StateReader.getResourceInfo(state, ls.resourceTypes[0]);
            const lName = lInfo && lInfo.pluralName || "";
            title = `${title}: List ${lName}`;
        }
    }
    document.title = title;
    return null;
};
