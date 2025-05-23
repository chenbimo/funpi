import { fnRoute, fnSchema, fnField, httpConfig } from 'funpi';
import { tableData } from '../../tables/example.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        apiName: '查询案例详情',
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
                const newsModel = fastify.mysql.table('news');

                const result = await newsModel //
                    .clone()
                    .where({ id: req.body.id })
                    .selectOne(fnField(tableData));

                return {
                    ...httpConfig.SELECT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.SELECT_FAIL;
            }
        }
    });
};
