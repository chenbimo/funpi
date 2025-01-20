import { fnRoute, fnSchema } from '../../utils/index.js';
import { appConfig } from '../../app.js';
import { tableData } from '../../tables/dict.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit'),
                keyword: fnSchema('keyword'),
                category_code: fnSchema(tableData.category_code)
            },
            required: ['category_code']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const dictModel = fastify.mysql //
                    .table('sys_dict')
                    .where('category_code', req.body.category_code)
                    .modify(function (db) {
                        if (req.body.keyword) {
                            db.where('name', 'like', `%${req.body.keyword}%`);
                        }
                    });

                // 记录总数
                const { totalCount } = await dictModel.clone().selectCount();

                // 记录列表
                const rowsTemp = await dictModel
                    //
                    .clone()
                    .orderBy('created_at', 'desc')
                    .selectData(req.body.page, req.body.limit);

                // 处理数字符号强制转换为数字值
                const rows = rowsTemp?.map((item) => {
                    if (item.symbol === 'number') {
                        item.value = Number(item.value);
                    }
                    return item;
                });

                return {
                    ...appConfig.http.SELECT_SUCCESS,
                    data: {
                        total: totalCount,
                        rows: rows,
                        page: req.body.page,
                        limit: req.body.limit
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.SELECT_FAIL;
            }
        }
    });
};
