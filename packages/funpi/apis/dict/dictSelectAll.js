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
                category_code: fnSchema(tableData.category_code)
            }
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const dictModel = fastify.mysql
                    .table('sys_dict')
                    .where('category_code', req.body.category_code)
                    .modify(function (db) {});

                const rowsTemp = await dictModel.clone().selectAll();

                const rows = rowsTemp?.map((item) => {
                    if (item.symbol === 'number') {
                        item.value = Number(item.value);
                    }
                    return item;
                });
                return {
                    ...appConfig.http.SELECT_SUCCESS,
                    data: {
                        rows: rows
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.SELECT_FAIL;
            }
        }
    });
};
