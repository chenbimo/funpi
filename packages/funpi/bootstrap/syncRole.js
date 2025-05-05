// 外部模块
import fp from 'fastify-plugin';
import { omit as es_omit } from 'es-toolkit';
// 工具函数
import { fnIncrTimeID, fnCryptoHmacMD5, fnCryptoMD5 } from '../utils/index.js';
// 配置文件
import { roleConfig } from '../config/role.js';

// 系统角色码
const systemRoleCodes = ['visitor', 'user', 'admin', 'super', 'dev'];

async function plugin(fastify) {
    // 同步接口
    try {
        // 准备好表
        const menuModel = fastify.mysql.table('sys_menu');
        const apiModel = fastify.mysql.table('sys_api');
        const adminModel = fastify.mysql.table('sys_admin');
        const roleModel = fastify.mysql.table('sys_role');

        // 查询所有角色
        const roleData = await roleModel.clone().selectAll();
        const roleDataByCode = roleData.map((item) => item.code);
        // 查询开发管理员
        const devAdminData = await adminModel.clone().where('username', 'dev').selectOne(['id']);
        // 查询开发角色
        const devRoleData = await roleModel.clone().where('code', 'dev').selectOne(['id']);

        // 请求菜单数据，用于给开发管理员绑定菜单
        const menuData = await menuModel.clone().selectAll();
        const menuIds = menuData.map((item) => item.id);

        // 请求接口数据，用于给开发管理员绑定接口
        const apiData = await apiModel.clone().selectAll();
        const apiIds = apiData.map((item) => item.id);

        // 处理角色数据，如果有同名的角色则删除
        const insertRoleData = [];
        const updateRoleData = [];

        // 需要同步的角色，过滤掉数据库中已经存在的角色
        for (let keyRole in roleConfig) {
            if (Object.prototype.hasOwnProperty.call(roleConfig, keyRole) === false) continue;
            const item = roleConfig[keyRole];
            const is_system = systemRoleCodes.includes(keyRole) ? 1 : 0;
            if (roleDataByCode.includes(keyRole) === false && keyRole !== 'dev') {
                const params = {
                    code: keyRole,
                    name: item.name,
                    describe: item.describe,
                    api_ids: '',
                    menu_ids: '',
                    is_system: is_system,
                    sort: item.sort || 1
                };
                // 角色不存在，则添加
                if (process.env.TABLE_PRIMARY_KEY === 'time') {
                    params.id = fnIncrTimeID();
                }

                insertRoleData.push(params);
            } else {
                updateRoleData.push({
                    code: keyRole,
                    name: item.name,
                    describe: item.describe,
                    is_system: is_system,
                    sort: item.sort || 1
                });
            }
        }

        // 只有主进程才操作一次
        if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
            if (insertRoleData.length > 0) {
                await roleModel.clone().insertData(insertRoleData);
            }

            // 如果待更新接口目录大于 0，则更新
            if (updateRoleData.length > 0) {
                const updateBatchData = updateRoleData.map((item) => {
                    return roleModel
                        .clone()
                        .where('code', item.code)
                        .updateData(es_omit(item, ['code']));
                });
                await Promise.all(updateBatchData);
            }
        }

        /**
         * 如果没有开发角色，则创建之
         * 如果有开发角色，则更新之
         */
        if (!devRoleData?.id) {
            const insertData = {
                code: 'dev',
                name: '开发管理员角色',
                describe: '技术性相关的管理和维护',
                menu_ids: menuIds.join(','),
                api_ids: apiIds.join(','),
                is_system: 1,
                sort: 0
            };
            if (process.env.TABLE_PRIMARY_KEY === 'time') {
                insertData.id = fnIncrTimeID();
            }
            // 只有主进程才操作一次
            if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
                await roleModel.clone().insertData(insertData);
            }
        } else {
            const updateData = {
                name: '开发管理员角色',
                describe: '技术性相关的管理和维护',
                menu_ids: menuIds.join(','),
                api_ids: apiIds.join(','),
                is_system: 1,
                sort: 0
            };
            // 只有主进程才操作一次
            if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
                await roleModel.clone().where('code', 'dev').updateData(updateData);
            }
        }

        // 如果没有开发管理员，则创建之
        if (!devAdminData?.id) {
            const insertData = {
                username: 'dev',
                nickname: '开发管理员',
                role: 'dev',
                is_system: 1,
                password: fnCryptoHmacMD5(fnCryptoMD5(process.env.DEV_PASSWORD), process.env.MD5_SALT)
            };
            if (process.env.TABLE_PRIMARY_KEY === 'time') {
                insertData.id = fnIncrTimeID();
            }
            // 只有主进程才操作一次
            if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
                await adminModel.clone().insertData(insertData);
            }
        } else {
            const updateData = {
                nickname: '开发管理员',
                role: 'dev',
                is_system: 1,
                password: fnCryptoHmacMD5(fnCryptoMD5(process.env.DEV_PASSWORD), process.env.MD5_SALT)
            };
            // 只有主进程才操作一次
            if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
                await adminModel.clone().where('username', 'dev').updateData(updateData);
            }
        }
        await fastify.cacheRoleData();
    } catch (err) {
        fastify.log.error(err);
        process.exit();
    }
}
export default fp(plugin, { name: 'funpiSyncDev', dependencies: ['funpiRedis', 'funpiMysql', 'funpiTool', 'funpiSyncApi', 'funpiSyncMenu'] });
