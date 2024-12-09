import { camelCase } from 'es-toolkit';
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
                category_id: fnSchema(tableData.category_id),
                category_code: fnSchema(tableData.category_code),
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                value: fnSchema(tableData.value),
                symbol: fnSchema(tableData.symbol),
                thumbnail: fnSchema(tableData.thumbnail),
                describe: fnSchema(tableData.describe)
            },
            required: ['category_id', 'category_code', 'code', 'name', 'value', 'symbol']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                // 如果传的值是数值类型，则判断是否为有效数值
                if (req.body.symbol === 'number') {
                    if (Number.isNaN(Number(req.body.value)) === true) {
                        return {
                            ...appConfig.http.INSERT_FAIL,
                            msg: '字典值不是一个数字类型'
                        };
                    }
                }

                const dictModel = fastify.mysql.table('sys_dict');

                const result = await dictModel.insertData({
                    category_id: req.body.category_id,
                    category_code: camelCase(req.body.category_code),
                    code: camelCase(req.body.code),
                    name: req.body.name,
                    value: req.body.value,
                    symbol: req.body.symbol,
                    thumbnail: req.body.thumbnail,
                    describe: req.body.describe
                });

                return {
                    ...appConfig.http.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.INSERT_FAIL;
            }
        }
    });
};