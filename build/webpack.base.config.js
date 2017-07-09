'use strict';

let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let HappyPack = require('happypack');   //loader 多进程处理

let getHappyPackConfig = require('./happypack');

let config = require('../config');

const env = process.env.NODE_ENV || 'development';
const apiPrefix = env === 'development' ? config.dev.prefix : config.build.prefix;

console.log('---------env------:', env, '------apiPrefix-------:', apiPrefix);

module.exports = {
    context: path.resolve(__dirname, "../src"),
    module: {
        noParse: [/static|assets/],
        rules: [
            {
                test: /\.vue$/,
                use: [{
                    loader: 'happypack/loader?id=vue'
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['happypack/loader?id=js']
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: '[name].[ext]?[hash:8]'
                    }
                }]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        limit: 10000,
                        name: '[name].[ext]?[hash:8]'
                    }
                }]
            }
        ]
    },

    resolve:{
        extensions:[".vue",".js"],
        modules: [path.join(__dirname, '../node_modules')],
        alias:{
            '@src': path.resolve(__dirname, '../src'),
            '@components': path.resolve(__dirname, '../src/components'),
            'vue$': 'vue/dist/vue.js'
        }
    },

    resolveLoader: {
        modules: [path.join(__dirname, '../node_modules')]
    },

    performance: {
        hints: false
    },

    plugins:[

        new webpack.DefinePlugin({
            'window.PREFIX': JSON.stringify(apiPrefix)
        }),

        //copy assets
        new CopyWebpackPlugin([
            {context: '../src', from: 'images/**/*', to: path.resolve(__dirname, '../dist'), force: true},
            {context: '../src', from: 'scripts/**/*', to: path.resolve(__dirname, '../dist'), force: true},
        ]),

        new HappyPack(getHappyPackConfig({
            id: 'vue',
            loaders: [{
                loader: 'vue-loader',
                options: {
                    // vue-loader 13(https://github.com/vuejs/vue-loader/releases) 默认将这里开启，但会导致 HMR 模式失效
                    // https://github.com/vuejs/vue-loader/issues/863
                    esModule: false
                }
            }]
        })),

        new HappyPack(getHappyPackConfig({
            id: 'js',
            loaders: ['babel-loader']
        })),


        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'index.html',
          inject: true,
          env: env,
          minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: false
          }
        })
    ]
};
