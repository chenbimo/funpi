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
                const menuModel = fastify.mysql.table('sys_menu');
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const menuData = await menuModel.clone().selectOne(['id']);

                if (!menuData?.id) {
                    return {
                        ...appConfig.http.DELETE_FAIL,
                        msg: '菜单不存在'
                    };
                }

                if (menuData.is_system === 1) {
                    return {
                        ...appConfig.http.DELETE_FAIL,
                        msg: '默认菜单，无法删除'
                    };
                }

                const childData = await menuModel.clone().where({ pid: req.body.id }).selectOne(['id']);

                if (childData?.id) {
                    return {
                        ...appConfig.http.DELETE_FAIL,
                        msg: '存在子菜单，无法删除'
                    };
                }

                const result = await menuModel.clone().where({ id: req.body.id }).deleteData();
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                await fastify.cacheMenuData();
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
