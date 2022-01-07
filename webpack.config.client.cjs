const path = require("path");
module.exports = {
    target: 'web',
    entry: {
        index: './src/ts/pages/index.ts',
        present: './src/ts/pages/present.ts',
        overlay: './src/ts/pages/overlay.ts'
    },
    mode: "production",
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        poll: true
    },
    node: false,
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, "/dist")
    }
}
