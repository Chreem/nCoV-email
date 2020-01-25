const getHtml = require('../service/get-html')
    , moment = require('moment')
    , cheerio = require('cheerio')
    , Timer = require('../service/timer')
    , sendEmail = require('../service/send-email')
    , { selectAll, select, insert } = require('../service/mysql')
    ;
const { AUTH_SERVER } = require('../config');


const parseHtmlString = str => {
    const $ = cheerio.load(str);
    const window = {};
    try {
        const getTimelineService = $('#getTimelineService');
        eval(getTimelineService.html());
        const getStatisticsService = $('#getStatisticsService');
        eval(getStatisticsService.html());
    } catch (e) { }
    return window;
}

const formatContent = ({ title, summary, infoSource, sourceUrl, pubDate }, { countRemark, imgUrl, dailyPic }, email) => {
    const unsubscribe = `${AUTH_SERVER}/unsubscribe?email=${encodeURIComponent(email)}`;
    pubDate = parseInt(pubDate) || (new Date().getTime());
    return `<html>
        <h1>${title}</h1>
        <div>时间：<span>${moment(pubDate).format('YYYY-MM-DD HH:mm')}</span></div>
        <div>${summary}</div>
        <div>消息来源：<a target="_blank" href="${sourceUrl}">${infoSource}</a></div>

        <div>当前人数：<span>${countRemark}</span></div>

        <div>数据来源：<a target="_blank" href="https://3g.dxy.cn/newh5/view/pneumonia">丁香园</a></div>
        <div>点此退订：<a target="_blank" href="${unsubscribe}">${unsubscribe}</a></div>
        <div>
            <img src="${imgUrl}" style="width: 100%"/>
        </div>
        <div>
            <img src="${dailyPic}" style="width: 100%"/>
        </div>
    </html>`;
}


module.exports = async () => {
    const news = {};
    const storedNews = await selectAll('news');
    storedNews.map(n => news[n.newsId] = n);
    const timer = new Timer({ apm: 1 / 10, ipm: 1 / 10, normalCallback: true });
    timer.startListen(async () => {
        try {
            const resultStr = await getHtml('https://3g.dxy.cn/newh5/view/pneumonia');
            const result = parseHtmlString(resultStr);

            // 获取未发送过的新闻
            const timeline = result.getTimelineService || [];
            let newItem = timeline.filter(({ id }) => !news[id]);
            if (newItem.length <= 0) return console.log('暂无新闻');
            newItem = newItem.map(({ id, pubDate, title, summary, infoSource, sourceUrl, provinceId, provinceName }) => {
                const item = { newsId: id, pubDate, title, summary, infoSource, sourceUrl, provinceId, provinceName };
                news[id] = item;
                return item;
            });

            // 获取订阅邮箱
            const emailsRow = await select('email', { push: '1' }) || [];
            if (emailsRow.length <= 0) return console.log('暂无订阅用户');
            const emails = emailsRow.map(item => item.email);

            // 将每条新的新闻单独发送给每个订阅用户
            for (let i = 0, len = newItem.length; i < len; i++) {
                await insert('news', newItem[i]);
                for (let j = 0, elen = emails.length; j < elen; j++) {
                    await sendEmail({
                        from: '疫情推送',
                        receiver: [emails[j]],
                        title: `【疫情推送】${newItem[i].title}`,
                        body: formatContent(newItem[i], result.getStatisticsService, emails[j])
                    });
                }
            }
        } catch (e) {
            console.log(e.toString());
        }
    });
};
