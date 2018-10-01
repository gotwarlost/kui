const webpack = require("webpack");
const path = require("path");
const distDir = path.resolve(__dirname, "..", "dist", "app");

module.exports = {
    entry: {
        "vendor": [
            "clone",
            "deep-equal",
            "js-yaml",
            "lodash",
            "moment",
            "oboe",
            "react",
            "react-dom",
            "react-redux",
            "react-router",
            "react-router-redux",
            "react-table",
            "redux",
            "redux-logger",
            "semantic-ui-react",
        ],
    },

    output: {
        filename: "[name].js",
        path: distDir,

        // The name of the global variable which the library"s
        // require() function will be assigned to
        library: "[name]_lib",
    },

    plugins: [
        new webpack.DllPlugin({
            // The name of the global variable which the library"s
            // require function has been assigned to. This must match the
            // output.library option above
            name: "[name]_lib",
            // The path to the manifest file which maps between
            // modules included in a bundle and the internal IDs
            // within that bundle
            path: path.resolve(distDir, "[name]-manifest.json"),
        }),
    ],
};
