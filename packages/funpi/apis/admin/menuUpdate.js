import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/menu.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('id'),
                pid: fnSchema(tableData.pid),
                name: fnSchema(tableData.name),
                value: fnSchema(tableData.value),
                image: fnSchema(tableData.image),
                sort: fnSchema(tableData.sort),
                describe: fnSchema(tableData.describe),
                is_open: fnSchema(tableData.is_open)
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const menuModel = fastify.mysql.table('sys_menu');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                // 如果传了 pid 值
                if (req.body.pid) {
                    const parentData = await menuModel.clone().where('id', req.body.pid).selectOne(['id']);
                    if (!parentData?.id) {
                        return {
                            ...httpConfig.FAIL,
                            msg: '父级菜单不存在'
                        };
                    }
                }

                const selfData = await menuModel.clone().where('id', req.body.id).selectOne(['id']);
                if (!selfData?.id) {
                    return {
                        ...httpConfig.FAIL,
                        msg: '菜单不存在'
                    };
                }

                await menuModel.clone().where({ id: req.body.id }).updateData({
                    pid: req.body.pid,
                    name: req.body.name,
                    value: req.body.value,
                    image: req.body.image,
                    sort: req.body.sort,
                    is_open: req.body.is_open,
                    describe: req.body.describe
                });
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                await fastify.cacheMenuData();
                return httpConfig.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.UPDATE_FAIL;
            }
        }
    });
};
