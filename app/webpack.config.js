const webpack = require("webpack");
const path = require("path");
const srcDir = path.resolve("src");
const distDir = path.resolve(__dirname, "..", "dist", "app");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        app: path.resolve(srcDir, "run.ts"),
    },
    module: {
        rules: [
            {
                loader: "awesome-typescript-loader?configFileName=./src/tsconfig.json",
                test: /\.tsx?$/,
            },

            {
                enforce: "pre",
                loader: "source-map-loader",
                test: /\.js$/,
            },
        ],
    },
    output: {
        filename: "[name].js",
        library: "bundle",
        path: distDir,
    },

    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.resolve(srcDir, "index.html"),
                to: distDir,
            },
            {
                from: path.resolve(srcDir, "css"),
                to: path.resolve(distDir, "css"),
            },
            {
                from: path.resolve(srcDir, "vendor"),
                to: path.resolve(distDir, "vendor"),
            },
            {
                from: path.resolve(srcDir, "icons"),
                to: path.resolve(distDir, "icons"),
            },
            {
                from: path.resolve(srcDir, "favicon.ico"),
                to: path.resolve(distDir, "favicon.ico"),
            },
        ]),
    ],

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
};
