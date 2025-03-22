import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '删除字典分类',
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
                const dictCategoryModel = fastify.mysql.table('sys_dict_category').where({ id: req.body.id });
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const dictModel = fastify.mysql.table('sys_dict');

                const dictCategoryData = await dictCategoryModel.clone().selectOne(['id']);

                if (!dictCategoryData?.id) {
                    return httpConfig.NO_DATA;
                }

                const childrenDict = await dictModel.clone().where({ category_id: req.body.id }).selectOne(['id']);
                if (childrenDict?.id) {
                    return {
                        ...httpConfig.DELETE_FAIL,
                        msg: '此分类下有字典数据，无法删除'
                    };
                }

                const result = await dictCategoryModel.clone().deleteData();
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                return {
                    ...httpConfig.DELETE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.DELETE_FAIL;
            }
        }
    });
};
