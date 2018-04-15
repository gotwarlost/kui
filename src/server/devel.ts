import {create} from "./index";
import {load} from "./lib/k8s-config";

const config = load(["/Users/kanantheswaran/.kube/config", "/tmp/x.x"]);
const server = create("/tmp", config);
// tslint:disable-next-line:no-console
console.log("listening on port 3000");
server.listen(3000);
