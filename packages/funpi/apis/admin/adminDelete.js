import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { appConfig } from '../../app.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id')
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const adminModel = fastify.mysql.table('sys_admin').where({ id: req.body.id });
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const adminData = await adminModel.clone().selectOne(['id']);
                if (!adminData?.id) {
                    return appConfig.http.NO_DATA;
                }

                const result = await adminModel.deleteData();
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                return {
                    ...appConfig.http.DELETE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.DELETE_FAIL;
            }
        }
    });
};
