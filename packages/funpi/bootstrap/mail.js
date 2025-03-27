import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

async function plugin(fastify) {
    const mailTransport = await nodemailer.createTransport({
        host: Bun.env.MAIL_HOST,
        port: Bun.env.MAIL_PORT,
        pool: Bun.env.MAIL_POOL === '1' ? true : false,
        secure: Bun.env.MAIL_SECURE === '1' ? true : false,
        auth: {
            user: Bun.env.MAIL_USER,
            pass: Bun.env.MAIL_PASS
        }
    });

    // 发送邮件
    function sendMail(params) {
        return new Promise((resolve, reject) => {
            try {
                const result = mailTransport.sendMail({
                    from: {
                        name: Bun.env.MAIL_FROM_NAME,
                        address: Bun.env.MAIL_FROM_EMAIL
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
