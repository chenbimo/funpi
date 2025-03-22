import { camelCase } from 'es-toolkit';
import { fnRoute, fnSchema, fnDataClear, fnRequestLog } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';
import { tableData } from '../../tables/dictCategory.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '更新字典分类',
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
                const adminActionLogModel = fastify.mysql.table('sys_admin_action_log');

                const dictCategoryData = await dictCategoryModel
                    .clone()
                    .where({ code: camelCase(req.body.code) })
                    .selectOne(['id']);

                if (dictCategoryData?.id && dictCategoryData?.id !== req.body.id) {
                    return {
                        ...httpConfig.FAIL,
                        msg: '当前编号已存在'
                    };
                }

                const result = await dictCategoryModel
                    .clone()
                    .where({ id: req.body.id })
                    .updateData({
                        code: camelCase(req.body.code),
                        name: req.body.name,
                        describe: req.body.describe
                    });
                await adminActionLogModel.clone().insertData(fnDataClear(fnRequestLog(req)));

                return httpConfig.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.UPDATE_FAIL;
            }
        }
    });
};
