var path = require("path");
var webpack = require("webpack");

module.exports = {
    mode: "development",
    entry: {
        "app": "./src/main.jsx",
        "test/app": "./src/test.jsx"
    },
    output: {
        path: path.join(__dirname, 'docs'),
        filename: '[name].bundle.js'
    },
    module:{
        rules:[
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"]
                }
            }
        ]
    }
}