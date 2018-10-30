import {Middleware} from "redux";
import {Client} from "../../client";
import {pathIntercept} from "./path-intercept";
import {setDoctitle} from "./set-doc-title";
import {stateWatch} from "./state-watch";
import {loadRelatedData} from "./related-data";

export function getMiddleware(client: Client): Middleware[] {
    return [
        pathIntercept(client),
        stateWatch(client),
        loadRelatedData(client),
        setDoctitle(client),
    ];
}
