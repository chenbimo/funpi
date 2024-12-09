import { camelCase } from 'es-toolkit';
import { fnRoute, fnSchema } from '../../utils/index.js';
import { appConfig } from '../../app.js';
import { tableData } from '../../tables/dictCategory.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: fnSchema('page'),
                code: fnSchema(tableData.code),
                name: fnSchema(tableData.name),
                describe: fnSchema(tableData.describe)
            },
            required: ['id', 'code']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const dictCategoryModel = fastify.mysql.table('sys_dict_category');

                const dictCategoryData = await dictCategoryModel
                    .clone()
                    .where({ code: camelCase(req.body.code) })
                    .selectOne(['id']);

                if (dictCategoryData?.id) {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '当前编号已存在'
                    };
                }

                const result = await dictCategoryModel //
                    .clone()
                    .where({ id: req.body.id })
                    .updateData({
                        code: camelCase(req.body.code),
                        name: req.body.name,
                        describe: req.body.describe
                    });

                return appConfig.http.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.UPDATE_FAIL;
            }
        }
    });
};
