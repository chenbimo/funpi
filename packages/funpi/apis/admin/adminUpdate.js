import { fnRoute, fnSchema, fnDataClear, fnRequestLog, fnCryptoHmacMD5 } from '../../utils/index.js';
import { appConfig } from '../../app.js';
import { tableData } from '../../tables/admin.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id'),
                username: fnSchema(tableData.username),
                password: fnSchema(tableData.password),
                nickname: fnSchema(tableData.nickname),
                role: fnSchema(tableData.role)
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                if (req.body.role === 'dev') {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '不能增加开发管理员角色'
                    };
                }
                const adminModel = fastify.mysql.table('sys_admin');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const adminData = await adminModel.clone().where('username', req.body.username).selectOne(['id']);
                if (adminData?.id && adminData?.id !== req.body.id) {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '管理员账号已存在'
                    };
                }
                const updateData = {
                    nickname: req.body.nickname,
                    username: req.body.username,
                    role: req.body.role
                };

                if (req.body.password) {
                    updateData.password = fnCryptoHmacMD5(req.body.password, process.env.MD5_SALT);
                }
                await adminModel.clone().where({ id: req.body.id }).updateData(updateData);

                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req, ['password'])));

                return appConfig.http.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.UPDATE_FAIL;
            }
        }
    });
};
