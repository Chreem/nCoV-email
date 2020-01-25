const session = require('express-session');
const FileStore = require('session-file-store')(session);

module.exports = session({
    secret: 'chreem-server',
    name: 'sid',
    cookie: {
        maxAge: 3600 * 1000,
        httpOnly: false
    },
    store: new FileStore(),
    resave: false,
    saveUninitialized: true,
});
