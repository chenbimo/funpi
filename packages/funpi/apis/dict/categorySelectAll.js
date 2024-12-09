import { fnRoute } from '../../utils/index.js';
import { appConfig } from '../../app.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {}
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const dictCategoryModel = fastify.mysql //
                    .table('sys_dict_category')
                    .modify(function (db) {});

                const rows = await dictCategoryModel.clone().selectAll();

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
