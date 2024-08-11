// 工具函数
import { fnRoute } from '../../utils/fnRoute.js';
import { fnSchema } from '../../utils/fnSchema.js';
import { fnField } from '../../utils/fnField.js';
// 配置文件
import { appConfig } from '../../config/app.js';
// 数据表格
import { tableData } from '../../tables/mailLog.js';
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit')
            },
            required: []
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const mailLogModel = fastify.mysql //
                    .table('sys_mail_log')
                    .modify(function (db) {
                        if (req.body.keyword !== undefined) {
                            db.where('nickname', 'like', `%${req.body.keyword}%`);
                        }
                    });

                // 记录总数
                const { totalCount } = await mailLogModel.clone().selectCount();

                // 记录列表
                const rows = await mailLogModel
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
