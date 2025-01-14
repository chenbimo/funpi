import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { appConfig } from '../../app.js';
import { tableData } from '../../tables/menu.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                pid: fnSchema(tableData.pid),
                name: fnSchema(tableData.name),
                value: fnSchema(tableData.value),
                image: fnSchema(tableData.image),
                sort: fnSchema(tableData.sort),
                describe: fnSchema(tableData.describe),
                is_open: fnSchema(tableData.is_open)
            },
            required: ['pid', 'name', 'value']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const menuModel = fastify.mysql.table('sys_menu');

                // 如果传了 pid 值，则判断父级是否存在
                if (req.body.pid) {
                    const parentData = await menuModel //
                        .clone()
                        .where('id', req.body.pid)
                        .selectOne(['id']);

                    if (!parentData?.id) {
                        return {
                            ...appConfig.http.FAIL,
                            msg: '父级菜单不存在'
                        };
                    }
                }

                await menuModel.clone().insertData({
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
                return appConfig.http.INSERT_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.INSERT_FAIL;
            }
        }
    });
};
