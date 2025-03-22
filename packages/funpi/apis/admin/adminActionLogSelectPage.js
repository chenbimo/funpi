import { fnRoute, fnSchema, fnField } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/adminActionLog.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '管理员操作日志-分页',
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
                const adminActionLogModel = fastify.mysql //
                    .table('sys_admin_action_log');

                const { totalCount } = await adminActionLogModel.clone().selectCount();
                const rows = await adminActionLogModel
                    //
                    .clone()
                    .orderBy('created_at', 'desc')
                    .selectData(req.body.page, req.body.limit, fnField(tableData));

                return {
                    ...httpConfig.SELECT_SUCCESS,
                    data: {
                        total: totalCount,
                        rows: rows,
                        page: req.body.page,
                        limit: req.body.limit
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.SELECT_FAIL;
            }
        }
    });
};
