// 外部模块
import { yd_crypto_hmacMd5 } from 'yidash/node';
import { omit as es_omit } from 'es-toolkit';
// 工具函数
import { fnRoute, fnSchema } from '../../util.js';
// 配置文件
import { appConfig } from '../../config/app.js';
// 数据表格
import { tableData } from '../../tables/admin.js';
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                account: fnSchema({ name: '账号', type: 'string', min: 1, max: 100 }),
                password: fnSchema(tableData.password)
            },
            required: ['account', 'password']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const adminModel = fastify.mysql.table('sys_admin');
                const adminLoginLogModel = fastify.mysql.table('sys_admin_login_log');

                // 查询管理员是否存在
                // TODO: 增加邮箱注册和邮箱登录
                const adminData = await adminModel //
                    .clone()
                    .orWhere({ username: req.body.account })
                    .selectOne(['id', 'password', 'username', 'nickname', 'role']);

                // 判断用户存在
                if (!adminData?.id) {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '用户不存在'
                    };
                }

                // 判断密码
                if (yd_crypto_hmacMd5(req.body.password, appConfig.md5Salt) !== adminData.password) {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '密码错误'
                    };
                }
                // 记录登录日志
                await adminLoginLogModel.clone().insertData({
                    user_id: adminData.id,
                    username: adminData.username,
                    nickname: adminData.nickname,
                    role: adminData.role,
                    ip: req.ip || '',
                    ua: req.headers['user-agent'] || ''
                });

                // 成功返回
                return {
                    ...appConfig.http.SUCCESS,
                    msg: '登录成功',
                    data: es_omit(adminData, ['password']),
                    token: await fastify.jwt.sign({
                        id: adminData.id,
                        username: adminData.username,
                        nickname: adminData.nickname,
                        role_type: 'admin',
                        role: adminData.role
                    })
                };
            } catch (err) {
                fastify.log.error(err);
                return {
                    ...appConfig.http.FAIL,
                    msg: '登录失败'
                };
            }
        }
    });
};
