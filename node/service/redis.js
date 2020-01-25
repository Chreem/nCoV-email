const redis = require('redis');
const { REDIS_ADDRESS, REDIS_PORT } = require('../config');

const client = redis.createClient(REDIS_PORT, REDIS_ADDRESS);

module.exports = {
    get: (key) => new Promise((r, j) => {
        client.get(key, (err, data) => {
            if (err) return j(err.message);
            r(data);
        });
    }),

    set: (k, v, e) => new Promise((r, j) => {
        client.set(k, v, (err) => {
            if (err) return j(err.message);
            if (e) client.expire(k, e, (err) => {
                if (err) return j(err.message);
                r();
            });
            else r();
        });
    }),

    del: key => new Promise((r, j) => {
        client.expire(key, 0, err => {
            if (err) return j(err.message);
            r();
        })
    })
}
