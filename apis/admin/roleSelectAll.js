// 工具函数
import { fnRoute } from '../../util.js';
// 配置文件
import { appConfig } from '../../config/app.js';
// 数据表格
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
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
