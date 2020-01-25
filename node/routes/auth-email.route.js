const response = require('../service/response')
    , sendEmail = require('../service/send-email')
    , stringRandom = require('string-random')
    ;

const { select, insert } = require('../service/mysql');
const { get, set } = require('../service/redis');
const { AUTH_SERVER } = require('../config');


const authBody = (link) => `<html>
    <div>点击此链接以验证邮件：<a target="_blank" href="${link}">点击此处</a></div>

    <div>若无法点击，请在新标签打开以下链接</div>
    <div>
        <a target="_blank" href="${link}">${link}</a>
    </div>
</html>`;

module.exports = async (req, res) => {
    try {
        const email = req.body.email;
        const result = await select('email', { email }) || [];
        const row = result[0];
        if (row && row.push === '1') return res.send(response.error('邮箱已验证'));
        if (!row) await insert('email', { email });
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
