//webpack的配置文件
//导入Node中的path模块，用于操作文件路径
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const extry =require('./config/entry_webpack.js')
const CopyWebpackPlugin= require('copy-webpack-plugin')
module.exports = {

    //配置入口文件
    entry:{
        "index":"./src/index.js"
    },
    output:{
        //出口文件的路径
        path: path.resolve(__dirname,'dist'),
        //出口(打包后）文件的命名 一般与入口文件保持一致
        filename:'[name].js',
        assetModuleFilename:'images/[hash][ext][query]'
    },
    module:{
        rules:[{
            //正则表达式，匹配以css结尾的文件
            test:/\.css$/,
            //use:['style-loader','css-loader'],
            use:[
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader'
            ]

        },{
          test:/\.scss$/,
          use:[
            MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
        },{
          test:/\.(png|jpg|gif)$/,
          type:'asset',
          parser:{
            dataUrlCondition:{
              maxSize:8*1024
            }
          }
        },{
          test:/\.js$/,
          use:[
            {
              loader:'babel-loader',
              options:{
                presets:['@babel/preset-env']
              }
            }
          ],exclude:/node_modules/
        }
      ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            minify:{
                //去掉属性的双引号
                removeAttributeQuotes:true
            },
            //给js文件加版本号，为了避免服务器的缓存
            hash:true,
            //配置要打包的html文件
            template:'./src/index.html'
        }),
        new MiniCssExtractPlugin({
          filename:'css/[name].css'
        }),
        new CopyWebpackPlugin({
          patterns:[{
            form:__dirname+'/src/pubilc',
            to :'./public'
          }]
        })

    ],
    //devserver 配置服务热更新
    devServer:{
        contentBase: path.resolve(__dirname,'dist'),
        host:'localhost',
        port:8088,
        open:true,
        compress:true

    }
}