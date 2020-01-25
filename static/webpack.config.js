const fs = require('fs')
    , path = require('path')
;
require('@babel/register')(JSON.parse(fs.readFileSync('./config/.babelrc')));
const WebpackConfig = require('./config/webpack.conf');

const config = new WebpackConfig('./src');
const url = '/';
config.setDistPath(path.resolve(__dirname, './dist'));
config.react('app.tsx');
if (process.env.NODE_ENV === 'production') {
    config.lib({
        'react': 'React',
        'react-dom': 'ReactDOM',
        'jquery': 'jQuery'
    });
}
module.exports = process.env.NODE_ENV === 'production' ? config.prod(url) : config.dev();
