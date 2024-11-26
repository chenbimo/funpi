import { fnRoute, fnSchema, appConfig } from 'funpi';
import { metaConfig } from './_meta.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
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
                const newsModel = fastify.mysql //
                    .table('news');

                const result = await newsModel.clone().where('id', req.body.id).deleteData();

                return {
                    ...appConfig.http.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.SELECT_FAIL;
            }
        }
    });
};
