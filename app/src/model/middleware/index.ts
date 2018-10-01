import {Middleware} from "redux";
import {Client} from "../../client";
import {pathIntercept} from "./path-intercept";
import {setDoctitle} from "./set-doc-title";
import {stateWatch} from "./state-watch";

export function getMiddleware(client: Client): Middleware[] {
    return [
        pathIntercept(client),
        stateWatch(client),
        setDoctitle(client),
    ];
}
