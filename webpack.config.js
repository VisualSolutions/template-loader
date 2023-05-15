const path = require('path');

module.exports = {
    output: {
        path: path.resolve(__dirname, 'release/js'),
    },
    entry: {
        "template-loader": './src/TemplateLoader.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};