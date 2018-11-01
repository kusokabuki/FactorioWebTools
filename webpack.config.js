var path = require("path");
var webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: "./src/main.jsx",
    output: {
        path: path.join(__dirname, 'docs'),
        filename: 'bundle.js'
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