const response = require('../service/response');
const { originSql } = require('../service/mysql');

module.exports = async (req, res) => {
    const result = await originSql(`
        select provinceId,provinceName
        from news
        group by provinceId,provinceName
        order by provinceId asc`);
    res.send(response.message(result));
}
