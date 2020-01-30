const moment = require('moment');

class Timer {
    config = {
        // 激活时间
        start: '18:30',
        end: '19:10',

        // 激活时间内的调用频率，30次/分
        apm: 30,

        // 非激活时间的频率，1次/3分
        ipm: 1 / 3,

        // 检测过程是否执行回调，false表示只在激活阶段回调
        normalCallback: false,

        log: false,
    };
    constructor(opt) { Object.assign(this.config, opt); }

    nItv = null;
    aItv = null;
    active = false;
    lastActive = null;

    startListen = callback => {
        if (!callback) throw new Error('callback is required');
        const { start, end, ipm, log, normalCallback } = this.config;
        const intervalCallback = () => {
            if (this.active) return;
            const today = moment().format('YYYY-MM-DD');
            let startTime = new Date(`${today} ${start}`).getTime();
            let endTime = new Date(`${today} ${end}`).getTime();
            if (endTime < startTime) return;
            if (this.lastActive && this.lastActive === today) return;
            const now = new Date().getTime();
            log && console.log('detect');
            normalCallback && callback();
            if (startTime <= now && now <= endTime) this.start(callback);
        };
        intervalCallback();
        this.nItv = setInterval(intervalCallback, 1000 * 60 / ipm);
    };

    start = callback => {
        const { apm, log } = this.config;
        clearInterval(this.aItv);
        this.lastActive = moment().format('YYYY-MM-DD');
        this.aItv = setInterval(() => {
            log && console.log('active');
            callback();
        }, 1000 * 60 / apm);
        this.active = true;
    }

    stop = () => {
        clearInterval(this.aItv);
        this.active = false;
    }

    stopAll = () => {
        clearInterval(this.nItv);
        clearInterval(this.aItv);
    }
}

module.exports = Timer;
