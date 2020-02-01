const getHtml = require('../service/get-html')
    , moment = require('moment')
    , cheerio = require('cheerio')
    , Timer = require('../service/timer')
    , sendEmail = require('../service/send-email')
    , { originSql, select, insert } = require('../service/mysql')
    , { set } = require('../service/redis')
    ;
const { AUTH_SERVER, IS_DEBUG, SPIDER_SITE } = require('../config');


const parseHtmlString = str => {
    const $ = cheerio.load(str);
    const window = {};
    try {
        const getTimelineService = $('#getTimelineService');
        eval(getTimelineService.html());
        const getStatisticsService = $('#getStatisticsService');
        eval(getStatisticsService.html());
        const getAreaStat = $('#getAreaStat');
        eval(getAreaStat.html());
    } catch (e) { }
    return window;
}

const formatContent = ({ title, summary, infoSource, sourceUrl, pubDate }, { confirmedCount, suspectedCount, curedCount, deadCount, dailyPic }, email) => {
    const unsubscribe = `${AUTH_SERVER}/unsubscribe?email=${encodeURIComponent(email)}`;
    pubDate = parseInt(pubDate) || (new Date().getTime());
    return `<html>
        <h1>${title}</h1>
        <div>时间：<span>${moment(pubDate).format('YYYY-MM-DD HH:mm')}</span></div>
        <div>${summary}</div>
        <div>消息来源：<a target="_blank" href="${sourceUrl}">${infoSource}</a></div>

        <div>当前人数：<span>全国 确诊${confirmedCount}，疑似${suspectedCount}，死亡${deadCount}，治愈${curedCount}</span></div>

        <div>数据来源：<a target="_blank" href="${SPIDER_SITE}">丁香园</a></div>
        <div>点此退订：<a target="_blank" href="${unsubscribe}">${unsubscribe}</a></div>
        <div>
            <img src="${dailyPic}" style="width: 100%"/>
        </div>
    </html>`;
}


module.exports = async () => {
    // 获取数据库最新的100条做缓存
    const news = {};
    const storedNews = await originSql(`
        select * from news
        order by newsId desc
        limit 100
    `);
    storedNews.map(n => news[n.newsId] = n);
    const interval = IS_DEBUG ? 10 : 1 / 15;
    const timer = new Timer({ apm: interval, ipm: interval, normalCallback: true });
    timer.startListen(async () => {
        try {
            const resultStr = await getHtml(SPIDER_SITE);
            const result = parseHtmlString(resultStr);

            // 更新患者，放入redis，超时时间为检测时间*2
            const peopleExires = 60 / interval * 2;
            const areaData = result.getAreaStat || [];
            const areaResult = [];
            areaData.map(({ provinceName, confirmedCount, suspectedCount, curedCount, deadCount, cities }) => {
                areaResult.push({ provinceName, confirmedCount, suspectedCount, curedCount, deadCount });
                cities.map(({ cityName, ...other }) => {
                    areaResult.push({ provinceName: `${cityName}市`, ...other });
                });
            });
            await set('AreaData', JSON.stringify(areaResult), peopleExires);

            // 获取未发送过的新闻
            const timeline = result.getTimelineService || [];
            let newItem = timeline.filter(({ id }) => !news[id]);
            if (newItem.length <= 0) return console.log('暂无新闻');
            newItem = newItem.map(({ id, pubDate, title, summary, infoSource, sourceUrl, provinceId, provinceName }) => {
                const item = { newsId: id, pubDate, title, summary, infoSource, sourceUrl, provinceId, provinceName };
                news[id] = item;
                return item;
            });
            for (let i = 0, len = newItem.length; i < len; i++) { await insert('news', newItem[i]); }
            newItem.sort((a, b) => b.pubDate - a.pubDate);

            // 获取订阅邮箱
            // if (IS_DEBUG) return;
            const emailsRow = await select('email', { push: '1' }) || [];
            if (emailsRow.length <= 0) return console.log('暂无订阅用户');

            // 将每条新的新闻单独发送给每个订阅用户
            for (let i = 0, len = newItem.length; i < len; i++) {
                for (let j = 0, elen = emailsRow.length; j < elen; j++) {
                    const emailTarget = emailsRow[j];
                    // 关注省为0则发送所有新闻，否则只发出关注的新闻
                    if (['', '0'].indexOf(emailTarget.focusProvinceId) < 0) {
                        // 当前关注者不感兴趣则跳过该关注者
                        const focus = emailTarget.focusProvinceId.split(',');
                        if (focus.indexOf(newItem[i].provinceId) < 0) {
                            // IS_DEBUG && console.log(`已跳过${newItem[i].provinceId}=>${newItem[i].title}，关注者聚焦省份id: ${emailTarget.focusProvinceId}`);
                            continue;
                        }
                    }
                    await sendEmail({
                        from: '疫情推送',
                        receiver: [emailTarget.email],
                        title: `【疫情推送】${newItem[i].title}`,
                        body: formatContent(newItem[i], result.getStatisticsService, emailTarget.email)
                    });
                }
            }
        } catch (e) {
            console.log(e.toString());
        }
    });
};
