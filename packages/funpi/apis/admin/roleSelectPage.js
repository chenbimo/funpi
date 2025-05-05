import { fnRoute, fnSchema } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit'),
                keyword: fnSchema('keyword')
            },
            required: []
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql //
                    .table('sys_role')
                    .where('code', '<>', 'dev')
                    .modify((db) => {
                        if (req.body.keyword) {
                            db.whereLike('name', `${req.body.keyword}`);
                        }
                    });

                const { totalCount } = await roleModel.clone().selectCount();
                const rows = await roleModel
                    //
                    .clone()
                    .orderBy([
                        { column: 'sort', order: 'asc' },
                        { column: 'created_at', order: 'desc' }
                    ])
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
