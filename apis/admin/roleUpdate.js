// 工具函数
import { fnRoute } from '../../utils/fnRoute.js';
import { fnSchema } from '../../utils/fnSchema.js';
// 配置文件夹
import { appConfig } from '../../config/app.js';
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
                id: fnSchema('id'),
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                describe: fnSchema(tableData.describe),
                menu_ids: fnSchema(tableData.menu_ids),
                api_ids: fnSchema(tableData.api_ids)
            },
            required: ['id']
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

                // 编码存在且 id 不等于当前角色
                if (roleData?.id !== req.body.id) {
                    return {
                        ...appConfig.http.INSERT_FAIL,
                        msg: '角色名称或编码已存在'
                    };
                }

                const result = await roleModel.clone().where({ id: req.body.id }).updateData({
                    code: req.body.code,
                    name: req.body.name,
                    describe: req.body.describe,
                    menu_ids: req.body.menu_ids,
                    api_ids: req.body.api_ids
                });

                await fastify.cacheRoleData();

                return {
                    ...appConfig.http.UPDATE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.UPDATE_FAIL;
            }
        }
    });
};
