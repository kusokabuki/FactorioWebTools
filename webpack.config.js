var path = require("path");
var webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: {
        "app": "./src/main.jsx",
        "test/app": "./test/test.jsx"
    },
    output: {
        path: path.join(__dirname, 'docs'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"]
                }
            },
            {
                test: /\.scss$/,
                use:[
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            sourceMap: false,
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false
                        }
                    }
                ]
            }
        ]
    }
}