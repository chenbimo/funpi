import { fnRoute, fnSchema, fnDataClear, fnRequestLog, fnCryptoHmacMD5 } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/api.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id'),
                state: fnSchema(tableData.state)
            },
            required: ['id', 'state']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const apiModel = fastify.mysql.table('sys_api');

                await apiModel.clone().where({ id: req.body.id }).updateData({ state: req.body.state });
                await fastify.cacheApiData();
                return httpConfig.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.UPDATE_FAIL;
            }
        }
    });
};
