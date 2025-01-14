import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { appConfig } from '../../app.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
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
                const roleModel = fastify.mysql.table('sys_role').where('id', req.body.id);
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const roleData = await roleModel.clone().selectOne(['id', 'is_system']);
                if (!roleData?.id) {
                    return appConfig.http.NO_DATA;
                }

                if (roleData.is_system === 1) {
                    return {
                        ...appConfig.http.DELETE_FAIL,
                        msg: '系统角色，无法删除'
                    };
                }

                const result = await roleModel.clone().deleteData();
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                // 生成新的权限
                await fastify.cacheRoleData();

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
