const webpack = require("webpack");
const path = require("path");
const srcDir = path.resolve("src");
const distDir = path.resolve(__dirname, "..", "dist");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        app: path.resolve(srcDir, "run.ts"),
    },
    mode: "development",
    module: {
        rules: [
            {
                loader: "ts-loader?configFile=tsconfig.json",
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
        new webpack.DllReferencePlugin({
            context: ".",
            manifest: require(path.resolve(distDir, "vendor-manifest.json")),
        }),

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
