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
                const dictCategoryModel = fastify.mysql //
                    .table('sys_dict_category')
                    .modify(function (db) {
                        if (req.body.keyword) {
                            db.where('name', 'like', `%${req.body.keyword}%`);
                        }
                    });

                // 记录总数
                const { totalCount } = await dictCategoryModel.clone().selectCount();

                // 记录列表
                const rows = await dictCategoryModel
                    //
                    .clone()
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
