// 工具函数
import { fnRoute, fnSchema, fnField } from '../../utils/index.js';
// 配置文件
import { appConfig } from '../../app.js';
// 数据表格
import { tableData } from '../../tables/adminLoginLog.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit')
            }
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const adminLoginLogModel = fastify.mysql //
                    .table('sys_admin_login_log');

                const { totalCount } = await adminLoginLogModel.clone().selectCount();
                const rows = await adminLoginLogModel
                    //
                    .clone()
                    .orderBy('created_at', 'desc')
                    .selectData(req.body.page, req.body.limit, fnField(tableData));

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
