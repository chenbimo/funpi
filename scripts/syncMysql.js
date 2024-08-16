#!/usr/bin/env node
// 先进行全面检测
import '../check.js';
// 内部模块
import { basename, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { randomInt } from 'node:crypto';
// 外部模块
import Knex from 'knex';
import colors from 'picocolors';
import Ajv from 'ajv';
import localize from 'ajv-i18n';
import {
    //
    yd_is_arrayContain,
    yd_is_object,
    yd_is_plainObject,
    yd_string_snakeCase,
    yd_array_diffBoth,
    yd_misc_4StateSymbol,
    yd_datetime_format
} from 'yidash';
// 配置文件
import { appConfig } from '../config/app.js';
import { tableSchema } from '../schema/table.js';
// 工具函数
import { system, fnImport } from '../util.js';

// 创建顺序自增唯一 ID
function fnIncrDate() {
    const dateFormat = yd_datetime_format(new Date(), 'yyyyMMddHHmmss');
    const random = randomInt(100000, 999999);
    return `${dateFormat}_${random}`;
}

// 不能设置的字段
const denyFields = [
    //
    'id',
    'created_at',
    'updated_at',
    'deleted_at'
];

const ajv = new Ajv({
    strict: false,
    allErrors: false,
    verbose: false
});

// 同步数据库
export const syncMysql = async () => {
    // let isPortOpen = await fnIsPortOpen(3000);
    // console.log('🚀 ~ file: syncCoreDatabase.js:220 ~ syncCoreDatabase ~ isPortOpen:', isPortOpen);
    // if (!isPortOpen) {
    //     console.log(`${yd_misc_4StateSymbol('warn')} 请停止应用后再同步！！！`);
    //     process.exit();
    // }
    // 定义数据库链接
    const mysql = await new Knex({
        client: 'mysql2',
        connection: {
            host: appConfig.mysql.host,
            port: appConfig.mysql.port,
            user: appConfig.mysql.username,
            password: appConfig.mysql.password,
            database: appConfig.mysql.db
        },
        acquireConnectionTimeout: 30000,
        asyncStackTraces: true,
        debug: false,
        pool: {
            min: 3,
            max: 10
        }
    });

    const trx = await mysql.transaction();

    try {
        const tableRecords = await trx
            .table('INFORMATION_SCHEMA.TABLES')
            .where({
                TABLE_TYPE: 'BASE TABLE',
                TABLE_SCHEMA: mysql.client.database()
            })
            .select('TABLE_NAME');
        // 获取所有的表
        const allTableName = tableRecords.map((item) => item.TABLE_NAME);
        // 所有的表数据
        const allDbTable = [];
        // 所有表文件
        const sysDbFiles = readdirSync(resolve(system.funpiDir, 'tables'));
        const appDbFiles = readdirSync(resolve(system.appDir, 'tables'));
        const allDbFiles = [
            //
            ...sysDbFiles.map((file) => {
                return {
                    prefix: 'sys_',
                    file: resolve(system.funpiDir, 'tables', file)
                };
            }),
            ...appDbFiles.map((file) => {
                return {
                    prefix: '',
                    file: resolve(system.appDir, 'tables', file)
                };
            })
        ];
        ajv.validateSchema(tableSchema);
        const validateTable = ajv.compile(tableSchema);

        for (let item of allDbFiles) {
            const pureFileName = basename(item.file, '.js');
            if (/[a-z][a-zA-Z0-9_]/.test(pureFileName) === false) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件名只能为 大小写字母+数字+下划线`);
                process.exit();
            }
            const tableFile = item.prefix + yd_string_snakeCase(pureFileName.trim());
            if (!item.prefix && tableFile.startsWith('sys_') === true) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 非系统表不能以 sys_ 开头`);
                process.exit();
            }
            const { tableName } = await fnImport(item.file, 'tableName', '');
            const { tableData } = await fnImport(item.file, 'tableData', {});

            if (!tableName) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件的 tableName 必须有表名称`);
                process.exit();
            }

            if (tableName.endsWith('_temp')) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件名不能以 _temp 结尾`);
                process.exit();
            }

            if (yd_is_object(tableData) === false) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件的 tableData 必须为对象结构`);
                process.exit();
            }

            if (yd_is_plainObject(tableData || {}) === true) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件的 tableData 必须为非空对象`);
                process.exit();
            }

            if (yd_is_arrayContain(Object.keys(tableData), denyFields) === true) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件的 tableData 不能包含 ${denyFields} 字段`);
                process.exit();
            }

            if (tableFile === 'sys_user' && !tableData.test_field) {
                console.log(`${yd_misc_4StateSymbol('warn')} ${item.file} 文件的 tableData 必须有一个test_field 测试字段`);
                process.exit();
            }

            const validResult = validateTable(tableData);
            if (!validResult) {
                localize.zh(validateTable.errors);
                console.log(yd_misc_4StateSymbol('error'), '[ ' + item.file + ' ] \n' + ajv.errorsText(validateTable.errors, { separator: '\n' }));
                process.exit();
            }

            allDbTable.push({
                tableFile: tableFile,
                tableName: (tableName + '表').replace('表表', '表'),
                tableData: tableData
            });
        }

        // 合并表参数
        for (let keyTable in allDbTable) {
            if (Object.prototype.hasOwnProperty.call(allDbTable, keyTable) === false) continue;
            const tableItem = allDbTable[keyTable];

            if (allTableName.includes(tableItem.tableFile) === true) {
                tableItem.tableFileTemp = tableItem.tableFile + '_temp';
            }

            // 判断新表是否存在，存在则删除，否则会报错
            if (allTableName.includes(tableItem.tableFileTemp) === true) {
                await trx.schema.dropTableIfExists(tableItem.tableFileTemp);
            }

            // 获取所有旧字段
            const allOldFieldsInfo = await mysql.table(tableItem.tableFile).columnInfo();
            const allOldFields = Object.keys(allOldFieldsInfo);
            // 获取当前的新字段
            const allNewFields = [
                //
                ...Object.keys(tableItem.tableData),
                ...denyFields
            ];
            // 判断字段是否有调整，如果没有调整则不用进行数据转移
            const allFieldDiff = yd_array_diffBoth(allNewFields, allOldFields);

            // 删除旧表
            // await trx.schema.dropTableIfExists(tableItem.tableOldName);
            // 如果不存在表，则直接创建
            await trx.schema.createTable(tableItem.tableFileTemp || tableItem.tableFile, (table) => {
                // 设置数据表的字符集和编码
                table.charset('utf8mb4');
                table.collate('utf8mb4_general_ci');
                // 设置表名称
                table.comment(tableItem.tableName);
                // 默认每个表的 ID 为自增流水号
                if (appConfig.tablePrimaryKey === 'default') {
                    table.increments('id');
                }
                if (appConfig.tablePrimaryKey === 'time') {
                    table.bigint('id').primary().notNullable().unsigned().comment('主键 ID');
                }
                // 设置时间
                table.bigint('created_at').index().notNullable().unsigned().defaultTo(0).comment('创建时间');
                table.bigint('updated_at').index().notNullable().unsigned().defaultTo(0).comment('更新时间');
                table.bigint('deleted_at').index().notNullable().unsigned().defaultTo(0).comment('删除时间');

                // 处理每个字段
                for (let keyField in tableItem.tableData) {
                    if (Object.prototype.hasOwnProperty.call(tableItem.tableData, keyField) === false) continue;
                    const itemData = tableItem.tableData[keyField];
                    let fieldHandler = null;
                    // 字符串
                    if (itemData.type === 'string') {
                        if (itemData?.max !== undefined) {
                            fieldHandler = table['string'](keyField, itemData.max);
                        } else {
                            fieldHandler = table['string'](keyField);
                        }
                    }
                    // 文本
                    if (['mediumText', 'text', 'bigText'].includes(itemData.type) === true) {
                        fieldHandler = table['text'](keyField, itemData.type.toLowerCase());
                    }
                    // 数字
                    if (['tinyInt', 'smallInt', 'int', 'mediumInt', 'bigInt'].includes(itemData.type) === true) {
                        if (itemData.type === 'int') {
                            fieldHandler = table['integer'](keyField);
                        } else {
                            fieldHandler = table[itemData.type.toLowerCase()](keyField);
                        }
                        if (itemData.isUnsigned !== false) {
                            fieldHandler = fieldHandler.unsigned();
                        }
                    }
                    // 小数
                    if (['float', 'double'].includes(itemData.type) === true) {
                        fieldHandler = table[itemData.type](keyField, itemData.precision || 8, itemData.scale || 2);
                        if (itemData.isUnsigned !== false) {
                            fieldHandler = fieldHandler.unsigned();
                        }
                    }

                    // 设置默认值
                    if (itemData.default !== undefined) {
                        fieldHandler = fieldHandler.defaultTo(itemData.default);
                    }
                    // 设置索引
                    if (itemData.isIndex === true) {
                        fieldHandler = fieldHandler.index();
                    }
                    // 设置唯一性
                    if (itemData.isUnique === true) {
                        fieldHandler = fieldHandler.unique();
                    }

                    // 设置不能为空、编码、注释
                    fieldHandler = fieldHandler.notNullable().collate('utf8mb4_general_ci').comment(itemData.name);
                }
            });

            // 如果创建的是新表，则把旧表的数据转移进来
            if (tableItem.tableFileTemp) {
                if (allFieldDiff.length > 0) {
                    // 提取所有旧字段跟新字段匹配的字段
                    const validFieldsRaw = allOldFields
                        .filter((field) => {
                            return allNewFields.includes(field);
                        })
                        .map((field) => '`' + field + '`')
                        .join(',');
                    await trx.raw(`INSERT INTO ${tableItem.tableFileTemp} (${validFieldsRaw}) SELECT ${validFieldsRaw} FROM ${tableItem.tableFile}`);
                    // 删除旧表，重命名新表
                    await trx.schema.renameTable(tableItem.tableFile, tableItem.tableFile + '_' + fnIncrDate());
                    await trx.schema.renameTable(tableItem.tableFileTemp, tableItem.tableFile);
                    console.log(`${yd_misc_4StateSymbol('success')} ${colors.magenta(tableItem.tableFile)}(${colors.blue(tableItem.tableName)}) ${colors.yellow('数据已同步')}`);
                } else {
                    await trx.schema.dropTableIfExists(tableItem.tableFileTemp);
                    console.log(`${yd_misc_4StateSymbol('success')} ${colors.magenta(tableItem.tableFile)}(${colors.blue(tableItem.tableName)}) ${colors.black('字段无改动')}`);
                }
            } else {
                console.log(`${yd_misc_4StateSymbol('success')} ${colors.magenta(tableItem.tableFile)}(${colors.blue(tableItem.tableName)}) ${colors.green('空表已创建')}`);
            }
        }
        await trx.commit();
        await trx.destroy();
        console.log(`${yd_misc_4StateSymbol('success')} ${appConfig.mysql.db} 数据库表同步成功`);
        process.exit();
    } catch (err) {
        console.log('🚀 ~ syncMysql ~ err:', err);
        await trx.rollback();
        await trx.destroy();
        console.log(`${yd_misc_4StateSymbol('error')} ${appConfig.mysql.db} 数据库表同步失败`);
        process.exit();
    }
};
