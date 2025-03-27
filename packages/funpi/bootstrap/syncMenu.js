// 内部模块
import { resolve } from 'pathe';
// 外部模块
import fp from 'fastify-plugin';
import { omit as es_omit, uniq as es_uniq, keyBy as es_keyBy } from 'es-toolkit';
// 工具函数
import { fnIncrTimeID, fnImport } from '../utils/index.js';
// 配置文件
import { menuConfig as internalMenuConfig } from '../config/menu.js';
import { appDir } from '../config/path.js';

// 同步菜单目录
async function syncMenuDir(fastify, menuConfig) {
    try {
        // 准备好表
        const menuModel = fastify.mysql.table('sys_menu');

        // 第一次请求菜单数据，用于创建一级菜单
        const menuDirDb = await menuModel.clone().where({ pid: 0 }).selectAll();
        const menuDirPaths = menuConfig.map((menu) => menu.path);
        const menuDirValue = es_keyBy(menuDirDb, (item) => item.value);

        const insertMenuDb = [];
        const deleteMenuDb = [];
        const updateMenuDb = [];

        for (let [index, item] of menuConfig.entries()) {
            const menuDirData = menuDirValue[item.path];
            if (menuDirData?.id) {
                updateMenuDb.push({
                    id: menuDirData.id,
                    name: item.name,
                    value: item.path,
                    pid: 0,
                    sort: index
                });
            } else {
                const insertData = {
                    name: item.name,
                    value: item.path,
                    pid: 0,
                    sort: index
                };
                if (Bun.env.TABLE_PRIMARY_KEY === 'time') {
                    insertData.id = fnIncrTimeID();
                }
                insertMenuDb.push(insertData);
            }
        }

        // 获得删除数据
        menuDirDb.forEach((item) => {
            if (!item.value || !menuDirPaths.includes(item.value)) {
                deleteMenuDb.push(item.id);
            }
        });

        if (!Bun.env.NODE_APP_INSTANCE || Bun.env.NODE_APP_INSTANCE === '0') {
            // 删除菜单目录
            if (deleteMenuDb.length > 0) {
                await menuModel.clone().whereIn('id', es_uniq(deleteMenuDb)).deleteData();
            }

            // 添加菜单目录
            if (insertMenuDb.length > 0) {
                await menuModel.clone().insertData(insertMenuDb);
            }

            // 如果待更新接口目录大于 0，则更新
            if (updateMenuDb.length > 0) {
                const updateBatch = updateMenuDb.map((item) => {
                    return menuModel
                        .clone()
                        .where('id', item.id)
                        .updateData(es_omit(item, ['id']));
                });
                await Promise.all(updateBatch);
            }
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit();
    }
}
// TODO: 需要进一步处理相同父级菜单下的同名子菜单去重问题

// 同步菜单文件
async function syncMenuFile(fastify, menuConfig) {
    try {
        // 准备好表
        const menuModel = fastify.mysql.table('sys_menu');

        const menuDirDb = await menuModel.clone().where({ pid: 0 }).selectAll();
        const menuDirValue = es_keyBy(menuDirDb, (item) => item.value);

        // 第二次请求菜单数据，用于创建二级菜单
        const menuFileDb = await menuModel.clone().where('pid', '<>', 0).selectAll();
        const menuFileValue = es_keyBy(menuFileDb, (item) => item.value);

        const menuFilePaths = [];
        const insertMenuDb = [];
        const updateMenuDb = [];
        const deleteMenuDb = [];

        for (let menu of menuConfig) {
            const menuDirData = menuDirValue[menu.path];
            if (!menuDirData?.id) {
                continue;
            }
            for (let [index, item] of menu.children.entries()) {
                const menuFileData = menuFileValue[item.path];
                menuFilePaths.push(item.path);
                if (menuFileData?.id) {
                    updateMenuDb.push({
                        id: menuFileData.id,
                        name: item.name,
                        value: item.path,
                        sort: index,
                        pid: menuDirData.id
                    });
                } else {
                    const insertMenuData = {
                        name: item.name,
                        value: item.path,
                        sort: index,
                        pid: menuDirData.id
                    };
                    if (Bun.env.TABLE_PRIMARY_KEY === 'time') {
                        insertMenuData.id = fnIncrTimeID();
                    }
                    insertMenuDb.push(insertMenuData);
                }
            }
        }

        // 获得删除数据
        menuFileDb.forEach((item) => {
            if (!item.value || !menuFilePaths.includes(item.value)) {
                deleteMenuDb.push(item.id);
            }
        });

        // 数据的同步只在主进程中操作
        if (!Bun.env.NODE_APP_INSTANCE || Bun.env.NODE_APP_INSTANCE === '0') {
            if (deleteMenuDb.length > 0) {
                await menuModel.clone().whereIn('id', es_uniq(deleteMenuDb)).deleteData();
            }

            if (insertMenuDb.length > 0) {
                await menuModel.clone().insertData(insertMenuDb);
            }

            // 如果待更新接口目录大于 0，则更新
            if (updateMenuDb.length > 0) {
                const updateBatchData = updateMenuDb.map((item) => {
                    return menuModel
                        .clone()
                        .where('id', item.id)
                        .updateData(es_omit(item, ['id']));
                });
                await Promise.all(updateBatchData);
            }
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit();
    }
}

// 转换

async function plugin(fastify) {
    try {
        const { menuConfig: userMenuConfig } = await fnImport(resolve(appDir, 'config', 'menu.js'), 'menuConfig', {});
        const allMenuConfig = [...userMenuConfig, ...internalMenuConfig];
        await syncMenuDir(fastify, allMenuConfig);
        await syncMenuFile(fastify, allMenuConfig);
        await fastify.cacheMenuData();
    } catch (err) {
        fastify.log.error(err);
    }
}
export default fp(plugin, { name: 'funpiSyncMenu', dependencies: ['funpiRedis', 'funpiMysql', 'funpiTool'] });
