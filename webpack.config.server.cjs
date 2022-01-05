const path = require("path");
module.exports = {
    target: 'node',
    entry: './src/ts/socket.ts',
    mode: "production",
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        poll: true
    },
    externals: {
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
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
        filename: 'server.cjs',
        path: path.join(__dirname, "/server")
    }
}
