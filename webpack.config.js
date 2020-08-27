const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractPlugin = new ExtractTextPlugin({
    filename: "main.css"
});
module.exports = {
    entry: './src/js/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: ""
    }, module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options:{
                            presets: ['es2015']
                        }
                    }
                ]
            },{
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
            test: /\.(png|svg|jpg|gif|pdf)$/,
             loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                }
            },
        ]
    },
    plugins: [
        extractPlugin
    ]
};
