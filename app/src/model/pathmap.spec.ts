import {assert as a} from "chai";
import "mocha";
import {path2Selection, selection2Path} from "./pathmap";
import {QueryScope} from "./types";

describe("path2Selection", () => {
    it("returns empty sel on falsy value", () => {
        const s = path2Selection({});
        a.deepEqual(s, {});
    });
    it("returns empty sel on bad path", () => {
        const s = path2Selection({pathname: "/api/foo/bar"});
        a.deepEqual(s, {});
    });
    it("returns context on basic path", () => {
        const s = path2Selection({pathname: "/ui/foobar"});
        a.deepEqual(s, {context: "foobar"});
    });
    it("returns context and cluster objects", () => {
        const s = path2Selection({pathname: "/ui/foobar/cluster"});
        a.deepEqual(s, {context: "foobar", namespace: {scope: QueryScope.CLUSTER_OBJECTS, namespace: ""}});
    });
    it("returns context and all namespaces", () => {
        const s = path2Selection({pathname: "/ui/foobar/all"});
        a.deepEqual(s, {context: "foobar", namespace: {scope: QueryScope.ALL_NAMESPACES, namespace: ""}});
    });
    it("returns context and single namespace", () => {
        const s = path2Selection({pathname: "/ui/foobar/ns,baz"});
        a.deepEqual(s, {context: "foobar", namespace: {scope: QueryScope.SINGLE_NAMESPACE, namespace: "baz"}});
    });
});

describe("selection2Path", () => {
    it("returns root path on empty selection", () => {
        const s = selection2Path({});
        a.deepEqual(s, {pathname: "/"});
    });
    it("returns basic path on context only", () => {
        const s = selection2Path({context: "foo"});
        a.deepEqual(s, {pathname: "/ui/foo", search: ""});
    });
    it("returns cluster path for cluster objects", () => {
        const s = selection2Path({context: "foo", namespace: {scope: QueryScope.CLUSTER_OBJECTS, namespace: ""}});
        a.deepEqual(s, {pathname: "/ui/foo/cluster", search: ""});
    });
    it("returns all path for all namespaces", () => {
        const s = selection2Path({context: "foo", namespace: {scope: QueryScope.ALL_NAMESPACES, namespace: ""}});
        a.deepEqual(s, {pathname: "/ui/foo/all", search: ""});
    });
    it("returns namespace path for single namespace", () => {
        const s = selection2Path({context: "foo", namespace: {scope: QueryScope.SINGLE_NAMESPACE, namespace: "baz"}});
        a.deepEqual(s, {pathname: "/ui/foo/ns,baz", search: ""});
    });
    it("returns base path when namespace missing", () => {
        const s = selection2Path({context: "foo", namespace: {scope: QueryScope.SINGLE_NAMESPACE, namespace: ""}});
        a.deepEqual(s, {pathname: "/ui/foo", search: ""});
    });
});
