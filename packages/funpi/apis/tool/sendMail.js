import { randomInt } from 'es-toolkit';
import { fnRoute, fnSchema } from '../../utils/index.js';
import { appConfig } from '../../app.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            oneOf: [
                {
                    title: '发送验证码邮件',
                    type: 'object',
                    properties: {
                        to_email: fnSchema({ name: '发送给谁', type: 'string', min: 5, max: 100 }),
                        subject: fnSchema({ name: '邮件主题', type: 'string', min: 1, max: 300 }),
                        verify_name: fnSchema({ name: '验证码名称', type: 'string', min: 2, max: 30, pattern: '^[a-z][a-zA-Z0-9]*' })
                    },
                    required: ['to_email', 'subject', 'verify_name']
                },
                {
                    title: '发送普通邮件',
                    type: 'object',
                    properties: {
                        to_email: fnSchema({ name: '发送给谁', type: 'string', min: 5, max: 100 }),
                        subject: fnSchema({ name: '邮件主题', type: 'string', min: 1, max: 300 }),
                        content: fnSchema({ name: '邮件内容', type: 'string', min: 1, max: 10000 })
                    },
                    required: ['to_email', 'subject', 'content']
                }
            ]
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const mailLogModel = fastify.mysql.table('sys_mail_log');
                // 普通发送
                if (req.body.content) {
                    await fastify.sendMail({
                        to: req.body.to_email,
                        subject: req.body.subject,
                        text: req.body.content
                    });
                    await mailLogModel.clone().insertData({
                        login_email: appConfig.mail.user,
                        from_name: appConfig.mail.from_name,
                        from_email: appConfig.mail.from_email,
                        to_email: req.body.to_email,
                        email_type: 'common',
                        text_content: req.body.content
                    });
                    return {
                        ...appConfig.http.SUCCESS,
                        msg: '邮件已发送',
                        from: 'new'
                    };
                }

                // 发送验证码
                if (req.body.verify_name) {
                    // 如果已经发送过
                    const existsVerifyCode = await fastify.redisGet(`${req.body.verify_name}:${req.body.to_email}`);
                    if (existsVerifyCode) {
                        return {
                            ...appConfig.http.SUCCESS,
                            msg: '邮箱验证码已发送（5 分钟有效）',
                            from: 'cache'
                        };
                    }

                    // 如果没有发送过
                    const cacheVerifyCode = randomInt(100000, 999999);
                    await fastify.redisSet(`${req.body.verify_name}:${req.body.to_email}`, cacheVerifyCode, 60 * 5);
                    await fastify.sendMail({
                        to: req.body.to_email,
                        subject: req.body.subject,
                        text: req.body.subject + '：' + cacheVerifyCode
                    });
                    await mailLogModel.clone().insertData({
                        login_email: appConfig.mail.user,
                        from_name: appConfig.mail.from_name,
                        from_email: appConfig.mail.from_email,
                        to_email: req.body.to_email,
                        email_type: 'verify',
                        text_content: '******'
                    });
                    return {
                        ...appConfig.http.SUCCESS,
                        msg: '邮箱验证码已发送（5 分钟有效）',
                        from: 'new'
                    };
                }
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.FAIL;
            }
        }
    });
};
