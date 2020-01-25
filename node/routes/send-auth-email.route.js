const response = require('../service/response');
const { get, set, del } = require('../service/redis');
const { select, insert, update } = require('../service/mysql');
const { FRONT_END } = require('../config');

module.exports = async (req, res) => {
    try {
        const eid = req.params.eid;
        const email = await get(eid);
        if (!email) {
            res.setHeader('refresh', `3;${FRONT_END}`);
            return res.send('链接超时，正在重定向...');
        }
        const result = await select('email', { email }) || [];
        const row = result[0];
        if (row) await update('email', { email }, { push: '1' });
        else await insert('email', { email, push: '1' });
        await del(eid);
        res.send('验证成功');
    } catch (e) {
        res.send(response.error(e.toString()));
    }
};
