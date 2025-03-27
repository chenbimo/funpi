import { fnRoute, fnSchema, fnDataClear, fnRequestLog, fnCryptoMD5, fnCryptoHmacMD5 } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/admin.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                username: fnSchema(tableData.username),
                password: fnSchema(tableData.password),
                nickname: fnSchema(tableData.nickname),
                role: fnSchema(tableData.role)
            },
            required: ['username', 'password', 'nickname', 'role']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                if (req.body.role === 'dev') {
                    return {
                        ...httpConfig.FAIL,
                        msg: '不能增加开发管理员角色'
                    };
                }
                const adminModel = fastify.mysql.table('sys_admin');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const adminData = await adminModel.clone().where('username', req.body.username).selectOne(['id']);
                if (adminData?.id) {
                    return {
                        ...httpConfig.FAIL,
                        msg: '管理员账号已存在'
                    };
                }

                const result = await adminModel.clone().insertData({
                    username: req.body.username,
                    password: fnCryptoHmacMD5(fnCryptoMD5(req.body.password), Bun.env.MD5_SALT),
                    nickname: req.body.nickname,
                    role: req.body.role
                });

                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req, ['password'])));

                return {
                    ...httpConfig.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.INSERT_FAIL;
            }
        }
    });
};
