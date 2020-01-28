const env = require('node-env-file');
const isDebug = process.env.NODE_ENV === 'development';
isDebug ? env(__dirname + '/.debug.env') : env(__dirname + '/.env');
const {
    EXPRESS_PORT,
    ...OTHER_ENV
} = process.env;

module.exports = {
    EXPRESS_PORT: EXPRESS_PORT || 4000,
    IS_DEBUG: isDebug,
    ...OTHER_ENV
};
