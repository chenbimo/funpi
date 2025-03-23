import { fnRoute, fnSchema, fnField, httpConfig } from 'funpi';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        apiName: '查询案例',
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit')
            },
            required: []
        },

        // 执行函数
        apiHandler: async (req) => {
            try {
                const newsModel = fastify.mysql //
                    .table('news');

                // 记录总数
                const { totalCount } = await newsModel
                    .clone() //
                    .selectCount();

                // 记录列表
                const rows = await newsModel
                    .clone() //
                    .orderBy('created_at', 'desc')
                    .selectData(req.body.page, req.body.limit);

                return {
                    ...httpConfig.SELECT_SUCCESS,
                    data: {
                        total: totalCount,
                        rows: rows,
                        page: req.body.page,
                        limit: req.body.limit
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.SELECT_FAIL;
            }
        }
    });
};
