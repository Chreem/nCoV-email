const response = require('../service/response');
const { select, update } = require('../service/mysql');

module.exports = async (req, res) => {
    try {
        const { email, provinceId: focusProvinceId } = req.body;
        const result = await select('email', { email }) || [];
        const row = result[0];
        if (!row) return res.send(response.error('邮箱有误'));
        await update('email', { email }, { focusProvinceId });
        return res.send(response.message('ok'));
    } catch (e) { res.send(response.error(e.toString())); }
}
