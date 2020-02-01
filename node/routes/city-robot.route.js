const { get } = require('../service/redis');

const wxRobotResponse = (code = 200, data = { confirmedCount: 0, suspectedCount: 0, curedCount: 0, deadCount: 0 }) => ({
    err_code: code,
    data_list: [data]
});

module.exports = async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) return res.send(wxRobotResponse(404));
        const areaData = JSON.parse(await get('AreaData')) || [];
        const result = areaData.filter(({ provinceName }) => {
            if (provinceName.indexOf(city) >= 0) return true;
        });
        const data = result[0];
        if (!data) return res.send(wxRobotResponse(404));
        res.send(wxRobotResponse(200, data));
    } catch (e) { res.send(wxRobotResponse(500)) }
}
