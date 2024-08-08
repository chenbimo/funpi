// 外部插件
import fp from 'fastify-plugin';
import { yd_object_omit, yd_array_unique, yd_array_keyBy } from 'yidash';
import { yd_number_incrTimeID } from 'yidash/node';
// 工具函数
// 配置文件
import { appConfig } from '../config/app.js';

// 同步菜单目录
async function syncMenuDir(fastify) {
    try {
        // 准备好表
        const menuModel = fastify.mysql.table('sys_menu');

        // 第一次请求菜单数据，用于创建一级菜单
        const menuDirDb = await menuModel.clone().where({ pid: 0 }).selectAll();
        const menuDirDbByValue = yd_array_keyBy(menuDirDb, 'value');

        const insertMenuDb = [];
        const deleteMenuDb = [];
        const updateMenuDb = [];
        let menuDbIndex = 1;

        for (let keyDir in appConfig.menu) {
            if (Object.prototype.hasOwnProperty.call(appConfig.menu, keyDir) === false) continue;
            const itemDir = appConfig.menu[keyDir];
            const menuDirData = menuDirDbByValue[keyDir];
            if (menuDirData?.id) {
                updateMenuDb.push({
                    id: menuDirData.id,
                    name: itemDir.name,
                    value: keyDir,
                    sort: itemDir.sort || menuDbIndex++,
                    is_system: itemDir.is_system || 0
                });
            } else {
                const insertData = {
                    name: itemDir.name,
                    value: keyDir,
                    pid: 0,
                    sort: itemDir.sort || menuDbIndex++,
                    is_open: 0,
                    is_system: itemDir.is_system || 0
                };
                if (appConfig.tablePrimaryKey === 'time') {
                    insertData.id = yd_number_incrTimeID();
                }
                insertMenuDb.push(insertData);
            }
        }

        // 获得删除数据
        menuDirDb.forEach((item) => {
            if (!item.value || !appConfig.menu[item.value]) {
                deleteMenuDb.push(item.id);
            }
        });

        if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
            // 删除菜单目录
            if (deleteMenuDb.length > 0) {
                await menuModel.clone().whereIn('id', yd_array_unique(deleteMenuDb)).deleteData();
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
                        .updateData(yd_object_omit(item, ['id']));
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
async function syncMenuFile(fastify) {
    try {
        // 准备好表
        const menuModel = fastify.mysql.table('sys_menu');

        const menuDirDb = await menuModel.clone().where({ pid: 0 }).selectAll();
        const menuDirDbByValue = yd_array_keyBy(menuDirDb, 'value');

        // 第二次请求菜单数据，用于创建二级菜单
        const menuFileDb = await menuModel.clone().where('pid', '<>', 0).selectAll();
        const menuFileDbByValue = yd_array_keyBy(menuFileDb, 'value');

        const insertMenuDb = [];
        const updateMenuDb = [];
        const deleteMenuDb = [];
        const menuConfigByFileValue = {};

        for (let keyDir in appConfig.menu) {
            if (Object.prototype.hasOwnProperty.call(appConfig.menu, keyDir) === false) continue;
            const menuChildren = appConfig.menu[keyDir].children;
            let menuDbIndex = 1;
            for (let keyFile in menuChildren) {
                if (Object.prototype.hasOwnProperty.call(menuChildren, keyFile) === false) continue;
                // const itemDir = appConfig.menu[keyDir];
                const itemFile = menuChildren[keyFile];
                const menuFileData = menuFileDbByValue[keyFile];
                const menuDirData = menuDirDbByValue[keyDir];
                menuConfigByFileValue[keyFile] = menuChildren[keyFile];
                if (menuFileData?.id) {
                    updateMenuDb.push({
                        id: menuFileData.id,
                        name: itemFile.name,
                        value: keyFile,
                        pid: menuDirData.id,
                        sort: itemFile.sort || menuDbIndex++,
                        is_system: itemFile.is_system || 0
                    });
                } else {
                    if (menuDirData) {
                        const insertMenuData = {
                            name: itemFile.name,
                            value: keyFile,
                            pid: menuDirData.id,
                            sort: itemFile.sort || menuDbIndex++,
                            is_open: 0,
                            is_system: itemFile.is_system || 0
                        };
                        if (appConfig.tablePrimaryKey === 'time') {
                            insertMenuData.id = yd_number_incrTimeID();
                        }
                        insertMenuDb.push(insertMenuData);
                    }
                }
            }
        }

        // 获得删除数据
        menuFileDb.forEach((item) => {
            if (!item.value || !menuConfigByFileValue[item.value]) {
                deleteMenuDb.push(item.id);
            }
        });

        // 数据的同步只在主进程中操作
        if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
            if (deleteMenuDb.length > 0) {
                await menuModel.clone().whereIn('id', yd_array_unique(deleteMenuDb)).deleteData();
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
                        .updateData(yd_object_omit(item, ['id']));
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
        await syncMenuDir(fastify);
        await syncMenuFile(fastify);
        await fastify.cacheMenuData();
    } catch (err) {
        fastify.log.error(err);
    }
}
export default fp(plugin, { name: 'syncMenu', dependencies: ['redis', 'mysql', 'tool'] });
