module.exports = app => {

    // app.post('/hook', require('./github.hook.route'));
    app.get('/auth', (req, res) => { res.send('Permission deny'); });
    app.post('/auth', require('./auth-email.route'));
    app.get('/province', require('./get-province.route'));
    app.get('/city', require('./city-robot.route'));
    app.post('/change', require('./change-province.route'));
    app.get('/unsubscribe', require('./unsubscribe.route'));
    app.get('/:eid', require('./send-auth-email.route'));
};
