import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '删除字典',
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
                const dictModel = fastify.mysql.table('sys_dict').where({ id: req.body.id });
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const dictData = await dictModel.clone().selectOne(['id']);
                if (!dictData?.id) {
                    return httpConfig.NO_DATA;
                }

                const result = await dictModel.clone().deleteData();
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                return {
                    ...httpConfig.DELETE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.DELETE_FAIL;
            }
        }
    });
};
