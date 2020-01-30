const { get } = require('../service/redis');

module.exports = async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) return res.sendStatus(404);
        const areaData = JSON.parse(await get('AreaData')) || [];
        const result = areaData.filter(({ provinceName }) => {
            if (provinceName.indexOf(city) >= 0) return true;
        });
        const data = result[0];
        if (!data) return res.sendStatus(404);
        res.send(data);
    } catch (e) { res.sendStatus(500) }
}
