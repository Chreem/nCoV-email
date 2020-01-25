const response = require('../service/response')
    ;
const { select, update } = require('../service/mysql');
const { FRONT_END } = require('../config');


module.exports = async (req, res) => {
    const email = req.query.email;
    if (!email) return res.send(response.error('邮箱有误'));
    try {
        const result = await select('email', { email }) || [];
        const row = result[0];
        if (!row) return res.send(response.error('邮箱不存在'));
        await update('email', { email }, { push: '0' });
        res.setHeader('refresh', `3;${FRONT_END}`);
        res.send('退订成功，正在重定向...');
    } catch (e) { res.send(response.error(e.toString())) }
};
