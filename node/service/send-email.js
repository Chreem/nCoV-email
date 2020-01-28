const { SENDER_SERVER, SENDER_PORT, SENDER_USER, SENDER_PASS } = require('../config');
const nodemailer = require('nodemailer')
    ;
const transporter = nodemailer.createTransport({
    host: SENDER_SERVER,
    port: SENDER_PORT,
    secure: true,
    port: 465,
    auth: {
        user: SENDER_USER,
        pass: SENDER_PASS
    }
});


module.exports = ({ from, receiver, title, body }) => new Promise((r, j) => {
    const mailOption = {
        from: `${from}<${SENDER_USER}>`,
        to: receiver.toString(),
        subject: title,
        html: body
    };

    transporter.sendMail(mailOption, (err, info) => {
        if (err) return j(err);
        return r(info);
    });
});
