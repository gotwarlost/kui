import {createBrowserHistory} from "history";
import {routerMiddleware} from "react-router-redux";
import {applyMiddleware, createStore} from "redux";
import {createLogger} from "redux-logger";
import {Client} from "./client";
import {App} from "./components/app";
import {getMiddleware} from "./model/middleware";
import {rootReducer} from "./model/reducers";
import {initialState} from "./model/state";

export function runApplication(el: string) {
    const apiURL = window.location.protocol + "//" + window.location.host + "/api/contexts";
    const client = new Client(apiURL);
    client.listContexts((err, list) => {
        if (err) {
            throw err;
        }
        const names = list.items;
        names.sort();
        const state = initialState(names);
        const h = createBrowserHistory();
        const store = createStore(
            rootReducer,
            state,
            applyMiddleware(
                ...getMiddleware(client),
                routerMiddleware(h),
                createLogger(),
            ),
        );
        App.start(store, h, el);
    });
}
