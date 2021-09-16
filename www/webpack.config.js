var path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './js/index.ts',
        "rich-editor": {
            //dependOn: 'main',
            import: './rich-editor/rich-editor-main.ts',
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },

    target: ['web', 'es2020'],
    watch: true,
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                },
                {
                    loader: "ifdef-loader",
                    options: {
                        DEBUG: true,
                    }
                }
            ]
        }],
    }
};
