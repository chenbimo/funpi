// 工具函数
import { yd_crypto_md5, yd_crypto_hmacMd5 } from 'yidash';
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
                username: fnSchema(tableData.username),
                password: fnSchema(tableData.password),
                nickname: fnSchema(tableData.nickname),
                role: fnSchema(tableData.role)
            },
            required: ['username', 'password', 'nickname', 'role']
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
                const adminModel = fastify.mysql.table('sys_admin');
                const adminData = await adminModel.clone().where('username', req.body.username).selectOne(['id']);
                if (adminData?.id) {
                    return {
                        ...appConfig.http.FAIL,
                        msg: '管理员账号或昵称已存在'
                    };
                }

                const result = await adminModel.clone().insertData({
                    username: req.body.username,
                    password: yd_crypto_hmacMd5(yd_crypto_md5(req.body.password), appConfig.md5Salt),
                    nickname: req.body.nickname,
                    role: req.body.role
                });
                return {
                    ...appConfig.http.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.INSERT_FAIL;
            }
        }
    });
};