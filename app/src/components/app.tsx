import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {Route} from "react-router";
import {ConnectedRouter} from "react-router-redux";
import {Store} from "redux";
import {State} from "../model/state";
import {PageSelector} from "./page-selector";
import {TopBar} from "./topbar";

export class App extends React.Component<{}, {}> {
    public static start(store: Store<State>, history: any, el: string) {
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Route path="/" component={App}/>
                </ConnectedRouter>
            </Provider>,
            document.getElementById(el),
        );
    }

    public render() {
        return (
            <div className="app">
                <TopBar location={(this.props as any).location}/>
                <div style={{margin: "0 1em"}}>
                    <PageSelector/>
                </div>
                <div style={{marginBottom: "10em"}}>&nbsp;</div>
            </div>
        );
    }
}
