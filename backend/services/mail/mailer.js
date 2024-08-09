import nodemailer from 'nodemailer';
import {config} from '../config.js';
import fs from "fs/promises";
import mustache from "mustache/mustache.mjs";

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    auth: {
        user: config.mail.user,
        pass: config.mail.password,
    },
});

const fromAddress = config.mail.from;

export async function sendRegistrationConfirmation(receiver) {
    const subject = 'Welcome to OverData!';
    const content =
        `<h1>Thank you for joining!</h1>
        <p>Welcome!</p>
        <p>We love you chose us to aid you in your adventures. Whether it be hiking, hunting, offroading or overlanding, we're certain we can improve the experience!</p>
        <h2>The great outdoors, data driven</h2>
        <p>In the age of information, not even the great outdoors can escape the reduction to data. Elevation data, property ownership, legal restrictions, fire trails, logging roads, all just a tap away!</p>
        <h2>Social networking</h2>
        <p>Don't forget to link your social networks! This allows you to share your planned trips and invite friends to join you.</p>
        <h2>Need help?</h2>
        <p>We would kindly refer you to our FAQ. Should the answer to your question not be in there, we'd love to answer it, just shoot us an email at helpdesk@overdata.com</p>
        <p>Kind regards,</p>
        <p>Helpdesk | OverData</p>`;

    await sendMail(subject, content, receiver);
}

export async function sendMail(subject, content, receiver) {
    if (config.import) {
        console.log('Dont mail while importing')
        return true
    }
    if (config.dev === "true") {
        subject = "To:" + receiver + " " + subject
        receiver = "kevin_kuyl@hotmail.com"
        console.log('Am in DEV-mode Sent mail to kevin_kuyl@hotmail.com' + subject);
    }
    const html = await generateHTML(content);

    const mailOptions = {
        from: fromAddress,
        to: receiver,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('email verzonden' + info.response);
        }
    });
}

async function generateHTML(content) {
    const template = await fs.readFile(new URL("../../assets/mail/template.html", import.meta.url), "utf-8");
    return mustache.render(template, {content: content});
}
