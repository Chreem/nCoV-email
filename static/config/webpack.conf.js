const fs = require('fs')
    , ejs = require('ejs')
    , path = require('path')
    , rimraf = require('rimraf')
    , merge = require('webpack-merge')
    , OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
    , TerserPlugin = require('terser-webpack-plugin')
    , BrowserSyncPlugin = require('browser-sync-webpack-plugin')
    , MiniCssExtractPlugin = require('mini-css-extract-plugin')
    , HtmlWebpackPlugin = require('html-webpack-plugin')
;


const lessLoaderConfig = {
    loader: 'less-loader',
    options: {javascriptEnabled: true}
};

class WebpackConf {
    basePath = '';
    config = {
        entry: {},
        output: {},
        plugins: [],
        externals: {},
        optimization: {
            minimizer: [],
            splitChunks: {
                cacheGroups: {}
            }
        },
        module: {
            rules: [
                {test: /\.css$/, loader: ['style-loader', 'css-loader', 'postcss-loader']},
                {
                    test: /\.less$/, loader: ['style-loader', 'css-loader', 'postcss-loader', lessLoaderConfig]
                },
                {test: /\.(mp3|ttf|otf|wav)$/, loader: 'file-loader', options: {name: '[name].[ext]'}},
                {test: /\.(jpg|jpeg|png|gif|svg)$/, loader: 'url-loader', options: {limit: 1, name: '[name].[ext]'}}
            ]
        },
        resolve: {
            alias: {},
            extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
        },
    };

    /**
     * 相对基础路径
     */
    constructor(basePath) {
        // 设置相对路径
        if (basePath.slice(-1) !== '/') basePath += '/';
        this.basePath = basePath;
        this.config.output.filename = '[name].js';
        this.config.output.path = path.resolve(__dirname, `.${basePath}dist`);
        this.addHtmlPlugin('index.template.html', 'index.html');
        this.addAlias({
            '~components': path.resolve('./src/components'),
            '~vendor': path.resolve('./src/vendor')
        });
    }

    /**
     * 各框架添加loader
     */
    react = (filepath, opt) => {
        const name = this.__getFileName(filepath);
        const {tsx, filename} = Object.assign(
            {tsx: true, filename: 'index.js'},
            opt
        );
        const {rules} = this.config.module;
        this.config.entry[name] = this.__pathPrefix(path.join(this.basePath, filename));
        if (!this.__findLoader('a.jsx')) rules.push({test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/});
        if (tsx && !this.__findLoader('a.tsx')) rules.push({
            test: /\.tsx?$/,
            loader: ['babel-loader', 'ts-loader'],
            exclude: /node_modules/
        });

        // 模板生成react hot index
        if (fs.existsSync(this.basePath + 'index.js')) return;
        ejs.renderFile('./config/react.ejs', {app: this.__pathPrefix(filepath), root: 'app'}, {}, (err, data) => {
            if (err) throw new Error('some error in ejs template');
            fs.writeFileSync(this.basePath + 'index.js', data);
        })
    };

    /**
     * 附加依赖
     */
        // 新增html模板
    addHtmlPlugin = (temp, name) => {
        const path = this.basePath;
        this.config.plugins.push(new HtmlWebpackPlugin({template: path + temp, name}));
    };

    // 超过size保持原样，小于size转为base64
    setBase64MaxSize = (size = 4096) => {
        const imgLoader = this.__findLoader('a.jpg');
        imgLoader.options.limit = size;
    };

    // 指定最终资源生成的目录
    setDistPath = path => this.config.output.path = path;

    // 解析路径别名
    addAlias = (name, path) => {
        if (name.constructor === String) return this.config.resolve.alias[name] = path;
        if (name.constructor === Object) return this.config.resolve.alias = name;
    };

    // 全局变量引用loader
    lib = (name, value) => {
        if (name.constructor === String) return this.config.externals[name] = value;
        if (name.constructor === Object) return this.config.externals = name;
    };

    /**
     * 私有方法
     */
        // 查询loader
    __findLoader = filename => {
        const {rules} = this.config.module;
        return rules.filter(item => item.test.test(filename))[0];
    };
    // 抽离css
    __extractCSS = filename => {
        [TerserPlugin, OptimizeCssAssetsPlugin].map(Plugin => {
            const isExist = this.config.plugins.filter(item => item.constructor === Plugin).length > 0;
            if (isExist) return;
            this.config.plugins.push(new Plugin({}));
        });
        this.config.optimization.splitChunks.cacheGroups['styles'] = {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
        };
        this.config.plugins.push(new MiniCssExtractPlugin({filename}));
        const cssLoader = this.__findLoader('a.css');
        cssLoader.loader = undefined;
        cssLoader.use = [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
        ];
        const lessLoader = this.__findLoader('a.less');
        lessLoader.loader = undefined;
        lessLoader.use = [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            lessLoaderConfig
        ];
        return this.config;
    };
    // 由路径获取文件名
    __getFileName = path => path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));

    // 读取版本信息并保存新版本号
    __versionControl = () => {
        const filepath = this.basePath + '.version';
        const exists = fs.existsSync(filepath);
        this.version = exists ? fs.readFileSync(this.basePath + '.version') : 0;
        this.version++;
        fs.writeFileSync(this.basePath + '.version', this.version);
    };
    __pathPrefix = path => {
        if (path.slice(0, 2) !== './') path = './' + path;
        return path;
    };

    /**
     * 生成配置，开发or生产环境区别
     */
    dev = (opt = {browserSync: true}) => {
        const {browserSync} = opt;
        const config = {
            devtool: 'cheap-module-eval-source-map',
            mode: 'development',
            devServer: {
                host: '0.0.0.0',
                noInfo: true,
                port: browserSync ? 8080 : 80,
                disableHostCheck: true
            },
            plugins: browserSync ? [new BrowserSyncPlugin(
                {host: '0.0.0.0', port: 80, open: false, proxy: 'http://localhost:8080'},
                {reload: false}
            )] : null,
            resolve: {alias: {'react-dom': '@hot-loader/react-dom'}}
        };

        return merge(this.config, config);
    };

    prod = (publicPath, opt) => {
        this.config.mode = 'production';
        const {extractCSS, removeOld, version} = Object.assign(
            {extractCSS: true, removeOld: true, version: true},
            opt);
        this.config.optimization.minimizer = [new TerserPlugin({})];
        const outputPath = this.config.output.path;
        if (version) {
            this.__versionControl();
            this.config.output.filename = `[name].v${this.version}.js`;
        }
        if (extractCSS) this.__extractCSS(version ? `style.v${this.version}.css` : null);
        if (publicPath) this.config.output.publicPath = publicPath;
        if (removeOld) rimraf(outputPath, () => console.log(`path: "${outputPath}" is clean`));
        return this.config;
    };
}

module.exports = WebpackConf;