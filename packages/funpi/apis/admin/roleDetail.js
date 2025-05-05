import { fnRoute, fnSchema } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                code: fnSchema('code')
            },
            required: ['code']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                const roleModel = fastify.mysql.table('sys_role').where('code', req.body.code);

                const result = await roleModel.clone().selectOne();

                if (!result?.id) {
                    return {
                        ...httpConfig.SELECT_FAIL,
                        msg: '没有查到角色信息'
                    };
                }

                return {
                    ...httpConfig.SELECT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.SELECT_FAIL;
            }
        }
    });
};
