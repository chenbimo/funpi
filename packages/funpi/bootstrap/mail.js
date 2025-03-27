import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

async function plugin(fastify) {
    const mailTransport = await nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        pool: process.env.MAIL_POOL === '1' ? true : false,
        secure: process.env.MAIL_SECURE === '1' ? true : false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    // 发送邮件
    function sendMail(params) {
        return new Promise((resolve, reject) => {
            try {
                const result = mailTransport.sendMail({
                    from: {
                        name: process.env.MAIL_FROM_NAME,
                        address: process.env.MAIL_FROM_EMAIL
                    },
                    ...params
                });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    fastify.decorate('sendMail', sendMail);
}
export default fp(plugin, { name: 'funpiMail' });
