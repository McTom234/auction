module.exports = {
    target: 'node',
    entry: './src/socket.ts',
    mode: "production",
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
        filename: 'bundle.cjs'
    }
}


