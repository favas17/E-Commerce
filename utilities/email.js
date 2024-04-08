require('dotenv').confiq();

const nodemailer = require('nodemailer');

const Email = process.env.Email
const Password = process.env.Password

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'Email',
        pass: 'Password'
    }
});

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'Email',
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendEmail };
