// 工具函数
import { fnRoute, fnSchema } from '../../utils/index.js';
// 配置文件
import { appConfig } from '../../app.js';
// 数据表格
import { tableData } from '../../tables/role.js';
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                describe: fnSchema(tableData.describe),
                menu_ids: fnSchema(tableData.menu_ids),
                api_ids: fnSchema(tableData.api_ids)
            },
            required: ['name', 'code']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql //
                    .table('sys_role');

                const roleData = await roleModel //
                    .clone()
                    .where('name', req.body.name)
                    .orWhere('code', req.body.code)
                    .selectOne(['id']);

                if (roleData?.id) {
                    return {
                        ...appConfig.http.INSERT_FAIL,
                        msg: '角色名称或编码已存在'
                    };
                }

                const result = await roleModel.clone().updateData({
                    code: req.body.code,
                    name: req.body.name,
                    describe: req.body.describe,
                    menu_ids: req.body.menu_ids.join(','),
                    api_ids: req.body.api_ids.join(',')
                });

                await fastify.cacheRoleData();

                return {
                    ...appConfig.http.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.INSERT_FAIL;
            }
        }
    });
};
