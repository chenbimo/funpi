import { fnRoute, fnSchema } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/dict.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '查询字典-全部',
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
                    ...httpConfig.SELECT_SUCCESS,
                    data: {
                        rows: rows
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.SELECT_FAIL;
            }
        }
    });
};
