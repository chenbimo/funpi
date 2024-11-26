// 工具函数
import { fnRoute, fnSchema } from '../../util.js';
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
            properties: {
                id: fnSchema('id')
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const adminModel = fastify.mysql //
                    .table('sys_admin')
                    .where({ id: req.body.id });

                const adminData = await adminModel.clone().selectOne(['id']);
                if (!adminData?.id) {
                    return appConfig.http.NO_DATA;
                }

                const result = await adminModel.deleteData();

                return {
                    ...appConfig.http.DELETE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.DELETE_FAIL;
            }
        }
    });
};
