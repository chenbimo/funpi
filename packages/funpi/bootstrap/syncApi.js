// 内部模块
import { basename, dirname, resolve } from 'pathe';
import { readdirSync } from 'node:fs';
// 外部模块
import fp from 'fastify-plugin';

// 工具函数
import { omit as es_omit, keyBy as es_keyBy, uniq as es_uniq, uniqBy as es_uniqBy } from 'es-toolkit';
import { isObject as es_isObject } from 'es-toolkit/compat';
// 工具函数
import { fnImport, fnIncrTimeID, fnApiFiles } from '../utils/index.js';
// 配置文件
import { appDir, funpiDir } from '../config/path.js';

// 同步接口目录
async function syncApi(fastify) {
    try {
        // 准备好表
        const apiModel = fastify.mysql.table('sys_api');

        // 本地的数据
        const allApiFiles = await fnApiFiles();
        const allDirPaths = es_uniqBy(allApiFiles, (item) => item.dirName).map((item) => item.dirName);
        const allFilePaths = allApiFiles.map((item) => item.fileName);

        // 数据库的数据
        const apis1 = await apiModel.clone().selectAll();
        const apiDirDb1 = apis1.filter((item) => item.pid === 0);
        const apiDirValue1 = es_keyBy(apiDirDb1, (item) => item.value);

        const deleteDirData = [];
        const insertDirData = [];
        const updateDirData = [];

        // 找出所有需要删除的接口目录
        apiDirDb1.forEach((item) => {
            if (allDirPaths.includes(item.value) === false) {
                deleteDirData.push(item.id);
            }
        });

        for (let dirPath of allDirPaths) {
            const apiDirData = apiDirValue1[dirPath];
            const apiParams = {
                value: dirPath,
                pid: 0,
                pids: '0'
            };

            if (apiDirData?.id) {
                // 如果数据库中已有此目录，则更新目录
                apiParams.id = apiDirData.id;
                updateDirData.push(apiParams);
            } else {
                // 如果数据库中没有此目录，则添加目录
                if (process.env.TABLE_PRIMARY_KEY === 'time') {
                    apiParams.id = fnIncrTimeID();
                }
                apiParams.name = dirPath;
                insertDirData.push(apiParams);
            }
        }

        // 只有主进程才操作一次
        if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
            // 如果待删除接口目录大于0，则删除
            if (deleteDirData.length > 0) {
                await apiModel.clone().whereIn('id', deleteDirData).deleteData();
            }

            // 如果待增加接口目录大于0，则增加
            if (insertDirData.length > 0) {
                await apiModel.clone().insertData(insertDirData);
            }

            // 如果待更新接口目录大于0，则更新
            if (updateDirData.length > 0) {
                const updateBatchData = updateDirData.map((item) => {
                    return apiModel
                        .clone()
                        .where('id', item.id)
                        .updateData(es_omit(item, ['id', 'created_at']));
                });
                await Promise.all(updateBatchData);
            }
        }

        const apis2 = await apiModel.clone().selectAll();
        const apiDirDb2 = apis2.filter((item) => item.pid === 0);
        const apiFileDb2 = apis2.filter((item) => item.pid !== 0);
        const apiDirValue2 = es_keyBy(apiDirDb2, (item) => item.value);
        const apiFileValue2 = es_keyBy(apiFileDb2, (item) => item.value);

        const deleteFileData = [];
        const insertFileData = [];
        const updateFileData = [];

        // 找出所有需要删除的接口文件
        apiFileDb2.forEach((item) => {
            if (allFilePaths.includes(item.value) === false) {
                deleteFileData.push(item.id);
            }
        });

        // 遍历项目接口文件
        for (let filePath of allFilePaths) {
            const apiDirData = apiDirValue2['/' + filePath.split('/').filter((v) => v)[1]];
            const apiFileData = apiFileValue2[filePath];

            const apiParams = {
                pid: apiDirData.id,
                pids: `0,${apiDirData.id}`,
                value: filePath
            };

            if (apiFileData?.id) {
                apiParams.id = apiFileData.id;
                updateFileData.push(apiParams);
            } else {
                if (process.env.TABLE_PRIMARY_KEY === 'time') {
                    apiParams.id = fnIncrTimeID();
                }
                apiParams.name = filePath;
                insertFileData.push(apiParams);
            }
        }

        // 数据的同步只在主进程中操作
        if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
            // 如果待删除接口大于0，则删除
            if (deleteFileData.length > 0) {
                await apiModel.clone().whereIn('id', deleteFileData).deleteData();
            }

            // 如果待增加接口大于0，则增加
            if (insertFileData.length > 0) {
                await apiModel.clone().insertData(insertFileData);
            }

            // 如果待更新接口大于0，则更新
            if (updateFileData.length > 0) {
                const updateBatchData = updateFileData.map((item) => {
                    return apiModel.clone().where('id', item.id).updateData(es_omit(item, 'id'));
                });
                await Promise.all(updateBatchData);
            }
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit();
    }
}

async function plugin(fastify) {
    // 同步接口
    try {
        await syncApi(fastify);
        await fastify.cacheApiData();
    } catch (err) {
        fastify.log.error(err);
    }
}
export default fp(plugin, { name: 'funpiSyncApi', dependencies: ['funpiRedis', 'funpiMysql', 'funpiTool'] });
