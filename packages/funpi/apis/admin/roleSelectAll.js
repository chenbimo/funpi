import { fnRoute } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '查询角色-全部',
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {}
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql //
                    .table('sys_role')
                    .modify(function (db) {
                        // 如果不是开发管理员查询，则排除掉开发角色
                        if (req.session.role !== 'dev') {
                            db.where('code', '<>', 'dev');
                        }
                    });

                const rows = await roleModel.clone().selectAll();

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
