import {app, Menu, Tray} from "electron";
import * as http from "http";
import * as open from "open";
import * as path from "path";
import {create as createServerApp} from "./server";
import {Config} from "./server/lib/k8s-config";

const appName = "Kubernetes local UI";
let tray = null;

const createSystemTray = (fn) => {
    tray = new Tray(path.resolve(__dirname, "app", "icons", "k8s.png"));
    const contextMenu = Menu.buildFromTemplate([
        {
            click: fn,
            label: "New browser window",
        },
        {
            type: "separator",
        },
        {
            click: () => app.quit(),
            label: "Exit",
        },
    ]);
    tray.setToolTip(appName);
    tray.setContextMenu(contextMenu);
};

app.on("ready", () => {
    const kc = process.env.KUBECONFIG || path.resolve(process.env.HOME, ".kube", "config");
    const files = kc.split(path.delimiter);
    const config = new Config(files);
    const root = path.resolve(__dirname, "app");
    const webapp = createServerApp(root, config);
    const server = http.createServer(webapp);
    server.on("listening", () => {
        const serverURL = `http://127.0.0.1:${server.address().port}`;
        // tslint:disable-next-line:no-console
        console.log("server URL is", serverURL);
        createSystemTray(() => {
            open(serverURL);
        });
        open(serverURL);
    });
    server.listen(0, "127.0.0.1");
    app.dock.hide();
});
