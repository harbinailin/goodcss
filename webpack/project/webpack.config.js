//webpack的配置文件
//导入Node中的path模块，用于操作文件路径
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {

    //配置入口文件
    entry:{
        "index":"./src/index.js"
    },
    output:{
        //出口文件的路径
        path: path.resolve(__dirname,'dist'),
        //出口(打包后）文件的命名 一般与入口文件保持一致
        filename:'[name].js'
    },
    module:{
        rules:[{
            //正则表达式，匹配以css结尾的文件
            test:/\.css$/,
            //use:['style-loader','css-loader'],
            use:[
              MiniCssExtractPlugin.loader,
              'css-loader'
            ]

        },{
          test:/\.scss$/,
          use:[MiniCssExtractPlugin.loader,
          'css-loader',
        'sass-loader']
        }]

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