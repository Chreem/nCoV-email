const bodyParser = require('body-parser');

module.exports = app => {
    app.use(require('./cors.mid'));
    app.use(require('./self-define-header.mid'));
    //   app.use(require('./session.mid'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
};
