const https = require('https');

module.exports = url => new Promise((r, j) => {
    let html = '';
    https.get(url, res => {
        res.on('data', data => html += data);
        res.on('end', () => r(html));
    })
        .on('error', () => j('解析出错'));
});