import { camelCase } from 'es-toolkit';
import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/dict.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '添加字典',
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
                            ...httpConfig.INSERT_FAIL,
                            msg: '字典值不是一个数字类型'
                        };
                    }
                }

                const dictModel = fastify.mysql.table('sys_dict');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

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
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

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
