import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/role.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                sort: fnSchema(tableData.sort),
                describe: fnSchema(tableData.describe),
                menu_ids: fnSchema(tableData.menu_ids),
                api_ids: fnSchema(tableData.api_ids)
            },
            required: ['name', 'code']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql.table('sys_role');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const roleData = await roleModel //
                    .clone()
                    .where('name', req.body.name)
                    .orWhere('code', req.body.code)
                    .selectOne(['id']);

                if (roleData?.id) {
                    return {
                        ...httpConfig.INSERT_FAIL,
                        msg: '角色名称或编码已存在'
                    };
                }

                const result = await roleModel.clone().insertData({
                    code: req.body.code,
                    name: req.body.name,
                    sort: req.body.sort,
                    describe: req.body.describe,
                    menu_ids: req.body.menu_ids,
                    api_ids: req.body.api_ids
                });
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                await fastify.cacheRoleData();

                return {
                    ...httpConfig.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.INSERT_FAIL;
            }
        }
    });
};
