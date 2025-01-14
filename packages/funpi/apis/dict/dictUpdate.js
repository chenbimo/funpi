import { camelCase } from 'es-toolkit';
import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { appConfig } from '../../app.js';
import { tableData } from '../../tables/dict.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id'),
                category_id: fnSchema(tableData.category_id),
                category_code: fnSchema(tableData.category_code),
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                value: fnSchema(tableData.value),
                symbol: fnSchema(tableData.symbol),
                thumbnail: fnSchema(tableData.thumbnail),
                describe: fnSchema(tableData.describe)
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                if (req.body.type === 'number') {
                    if (Number.isNaN(Number(req.body.value)) === true) {
                        return {
                            ...appConfig.http.UPDATE_FAIL,
                            msg: '字典值不是一个数字类型'
                        };
                    }
                }
                const dictModel = fastify.mysql.table('sys_dict').modify(function (db) {});
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const result = await dictModel
                    .clone()
                    .where({ id: req.body.id })
                    .updateData({
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

                return appConfig.http.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.UPDATE_FAIL;
            }
        }
    });
};
