import { fnRoute, fnSchema, httpConfig } from 'funpi';
import { tableData } from '../../tables/example.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        apiName: '更新案例',
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id'),
                title: fnSchema(tableData.title),
                content: fnSchema(tableData.content)
            },
            required: ['id']
        },

        // 执行函数
        apiHandler: async (req) => {
            try {
                const newsModel = fastify.mysql.table('news');

                const result = await newsModel //
                    .clone()
                    .where('id', req.body.id)
                    .updateData({
                        title: req.body.title,
                        content: req.body.content
                    });

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
