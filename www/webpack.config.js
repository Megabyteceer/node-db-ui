var path = require('path');

module.exports = {
    mode: 'development',
    //  mode: 'production',
    entry: {
        main: './src/index.ts',
        "rich-editor": {
            dependOn: 'main',
            import: './src/rich-editor/rich-editor-main.ts',
        },
        "en": {
            dependOn: 'main',
            import: './src/locales/en/lang.ts',
        },
        "ru": {
            dependOn: 'main',
            import: './src/locales/ru/lang.ts',
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    target: ['web', 'es2020'],
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
                        DEBUG: false,
                    }
                },
                path.resolve(__dirname, '../assert-strip-loader.js')
            ]
        }],
    }
};
