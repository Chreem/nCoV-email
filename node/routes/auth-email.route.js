const response = require('../service/response')
    , sendEmail = require('../service/send-email')
    , stringRandom = require('string-random')
    ;

const { select, update, insert } = require('../service/mysql');
const { get, set } = require('../service/redis');
const { AUTH_SERVER } = require('../config');


const authBody = (link) => `<html>
    <div>打开此链接以验证邮件：<a target="_blank" href="${link}">${link}</a></div>
</html>`;

module.exports = async (req, res) => {
    try {
        const { email, provinceId: focusProvinceId } = req.body;
        const result = await select('email', { email }) || [];
        const row = result[0];
        if (row && row.push === '1') return res.send(response.error('邮箱已验证'));
        if (!row) await insert('email', { email, focusProvinceId });
        if (row && focusProvinceId) await update('email', { email }, { focusProvinceId });
        const key = stringRandom(16);
        await set(key, email, 3 * 3600);    // 超时3小时
        await sendEmail({
            from: '推送验证',
            receiver: [email],
            title: '【疫情推送】验证邮件，请勿回复',
            body: authBody(`${AUTH_SERVER}/${key}`)
        });
        res.send(response.message('ok'));
    } catch (e) {
        res.send(response.error(e.toString()));
    }
};
