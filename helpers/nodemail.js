const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "", //input mail
        pass: ""  // input password
    },
    secure:true
})

module.exports = transporter