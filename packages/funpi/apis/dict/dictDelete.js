import { fnRoute, fnSchema } from '../../utils/index.js';
import { appConfig } from '../../app.js';

// 处理函数
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
                const dictModel = fastify.mysql //
                    .table('sys_dict')
                    .where({ id: req.body.id });

                const dictData = await dictModel.clone().selectOne(['id']);
                if (!dictData?.id) {
                    return appConfig.http.NO_DATA;
                }

                const result = await dictModel.clone().deleteData();
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
