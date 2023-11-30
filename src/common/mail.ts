import nodemailer from 'nodemailer';
import postmarkTransport from 'nodemailer-postmark-transport'
import fs from 'fs';
import path from 'path';
import { User, Site, Client } from '../models';

export async function sendEmail(userId: String, subject: String, temp: String, content: any = {}) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mahespandi0321@gmail.com',
            pass: 'ndntrmbkntelhiks',
        }
    });
    let model: any = content.type != undefined ? Client : User;
    let userData: any = await model.findById(userId);
    const siteData: any = await Site.findOne();
    if (userData && siteData) {
        let Email = userData.email;
        let template: String = await getTemplate(temp);
        template = template
            .replace(new RegExp("\\[Product Name\\]", "g"), siteData.site)
            .replace(new RegExp("\\[Company Name\\]", "g"), siteData.siteName)
            .replace(new RegExp("\\[action_url\\]", "g"), siteData.siteUrl)
            .replace(new RegExp("\\[Phone\\]", "g"), siteData.phone)
            .replace(new RegExp("\\[Address\\]", "g"), siteData.address)
            .replace(new RegExp("\\{\\{name\\}\\}", "g"), userData.username != undefined ? userData.username : userData.firstName);

        if (Object.keys(content).length != 0) {
            Email = content.email != undefined ? content.email : userData.email
            template = template
                .replace(new RegExp("\\{\\{forgetPasswordUrl\\}\\}", "g"), content.forgetPasswordUrl)
                .replace(new RegExp("\\[inviteUrl\\]", "g"), content.inviteUrl)
                .replace(new RegExp("\\[confirm_url\\]", "g"), content.confirm_url)
        }

        const mailOptions: any = {
            from: 'mahespandi0321@gmail.com',
            to: Email,
            subject: subject,
            html: template
        };
        try {
            // Send the email
            const info: any = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    } else {
        console.error('User Not found');

    }
}

export async function getTemplate(name: String): Promise<String> {
    return new Promise((resolve) => {
        let text: String = fs.readFileSync(path.join(__dirname, '../templates/' + name + '.html'), "utf8");
        resolve(text);
    })
}
