// 工具函数
import { yd_crypto_hmacMd5 } from 'yidash/node';
import { fnRoute, fnSchema } from '../../util.js';
// 配置文件
import { appConfig } from '../../config/app.js';
// 数据表格
import { tableData } from '../../tables/admin.js';
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
                password: fnSchema(tableData.password),
                nickname: fnSchema(tableData.nickname),
                role: fnSchema(tableData.role)
            },
            required: ['id']
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                if (req.body.role === 'dev') {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '不能增加开发管理员角色'
                    };
                }
                const adminModel = fastify.mysql //
                    .table('sys_admin')
                    .where({ id: req.body.id });

                await adminModel.clone().updateData({
                    password: yd_crypto_hmacMd5(req.body.password, appConfig.md5Salt),
                    nickname: req.body.nickname,
                    role: req.body.role
                });

                return appConfig.http.UPDATE_SUCCESS;
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.UPDATE_FAIL;
            }
        }
    });
};
