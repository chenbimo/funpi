// 工具函数
import { fnRoute } from '../../utils/fnRoute.js';
import { fnSchema } from '../../utils/fnSchema.js';
// 配置文件
import { appConfig } from '../../config/app.js';
// 数据表格
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    // 当前文件的路径，fastify 实例
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                page: fnSchema('page'),
                limit: fnSchema('limit'),
                keyword: fnSchema('keyword')
            },
            required: []
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql //
                    .table('sys_role')
                    .where('code', '<>', 'dev')
                    .modify((db) => {
                        if (req.body.keyword) {
                            db.whereLike('name', `${req.body.keyword}`);
                        }
                    });

                const { totalCount } = await roleModel.clone().selectCount();
                const rows = await roleModel
                    //
                    .clone()
                    .orderBy('created_at', 'desc')
                    .selectData(req.body.page, req.body.limit);

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
