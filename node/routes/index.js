module.exports = app => {
    // app.post('/hook', require('./github.hook.route'));
    app.get('/auth', (req, res) => { res.send('Permission deny'); });
    app.post('/auth', require('./auth-email.route'));
    app.get('/unsubscribe', require('./unsubscribe.route'));
    app.get('/:eid', require('./send-auth-email.route'));
};
