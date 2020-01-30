const moment = require('moment');

module.exports = new class {
    now = () => new Date().getTime();

    dayStart = (time = this.now()) => {
        const timeStr = moment(time).format('YYYY/MM/DD ') + '00:00:00';
        return moment(timeStr).valueOf();
    };
}
