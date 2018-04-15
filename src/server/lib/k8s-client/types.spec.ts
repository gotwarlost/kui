import {assert as a} from "chai";
import "mocha";
import * as client from "./index";
import {ResourceRegistry} from "./types";

describe("resource type info", () => {
    it("is initialized correctly for simple resource", () => {
        const t = new client.ResourceInfo("foobars", "FooBar", true, "/apis", "me/v1");
        a.equal(t.resourceName, "foobars");
        a.equal(t.kind, "FooBar");
        a.isTrue(t.isClusterResource);
        a.equal(t.prefix, "/apis");
        a.equal(t.version, "me/v1");
        a.equal(t.displayName, "Foo Bar");
        a.equal(t.pluralName, "Foo Bars");
    });

    it("is initialized correctly for icy resource", () => {
        const t = new client.ResourceInfo("foobarpolicies", "FooBarPolicy", false, "/apis", "me/v2");
        a.isFalse(t.isClusterResource);
        a.equal(t.displayName, "Foo Bar Policy");
        a.equal(t.pluralName, "Foo Bar Policies");
    });
});

describe("resource registry", () => {
    const rr = new ResourceRegistry({
        bars: new client.ResourceInfo("bars", "BarBar", false, "/apis", "extensions/v1"),
        foopolicies: new client.ResourceInfo("foopolicies", "FooBarPolicy", false, "/apis", "me/v2"),
        foos: new client.ResourceInfo("foos", "FooBar", true, "/apis", "me/v1"),
    });
    it("returns resources by name", () => {
        a.isTrue(rr.hasResource("foos"));
        a.isFalse(rr.hasResource("bazs"));
        const t = rr.getResourceInfo("foos");
        a.equal(t.resourceName, "foos");
        a.equal(t.kind, "FooBar");
        a.isTrue(t.isClusterResource);
    });
    it("returns namespaced resources", () => {
        const nr = rr.getNamespacedResources();
        a.equal(2, nr.length);
        a.equal("bars", nr[0].resourceName);
        a.equal("foopolicies", nr[1].resourceName);
    });
    it("returns cluster resources", () => {
        const nr = rr.getClusterResources();
        a.equal(1, nr.length);
        a.equal("foos", nr[0].resourceName);
    });
});
