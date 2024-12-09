import { fnRoute, fnSchema } from '../../utils/index.js';
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
                const dictCategoryModel = fastify.mysql //
                    .table('sys_dict_category')
                    .where({ id: req.body.id });

                const dictModel = fastify.mysql.table('sys_dict');

                const dictCategoryData = await dictCategoryModel.clone().selectOne(['id']);

                if (!dictCategoryData?.id) {
                    return appConfig.http.NO_DATA;
                }

                const childrenDict = await dictModel.clone().where({ category_id: req.body.id }).selectOne(['id']);
                if (childrenDict?.id) {
                    return {
                        ...appConfig.http.DELETE_FAIL,
                        msg: '此分类下有字典数据，无法删除'
                    };
                }

                const result = await dictCategoryModel.clone().deleteData();
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