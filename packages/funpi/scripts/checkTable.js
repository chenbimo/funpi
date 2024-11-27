#!/usr/bin/env node
// 内部模块
import { basename, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { randomInt } from 'node:crypto';
// 外部模块
import Knex from 'knex';
import Ajv from 'ajv';
import { isPlainObject as es_isPlainObject, snakeCase as es_snakeCase } from 'es-toolkit';
import { isObject as es_isObject } from 'es-toolkit/compat';
import { yd_is_arrayContain, yd_array_diffBoth } from 'yidash';
// 配置文件

import { appConfig } from '../app.js';
import { tableSchema } from '../schema/table.js';
import { ajvZh } from '../utils/ajvZh.js';
import { fnImport, log4state } from '../utils/index.js';
import colors from '../utils/colors.js';

const ajv = new Ajv({
    strict: false,
    allErrors: false,
    verbose: false
});

// 不能设置的字段
const denyFields = [
    //
    'id',
    'created_at',
    'updated_at',
    'deleted_at'
];

const fieldTypes = [
    //
    'string',
    'mediumText',
    'text',
    'bigText',
    'tinyInt',
    'smallInt',
    'mediumInt',
    'int',
    'bigInt',
    'float',
    'double'
];

const validate = {
    string: ajv.compile(tableSchema['string']),
    mediumText: ajv.compile(tableSchema['mediumText']),
    text: ajv.compile(tableSchema['text']),
    bigText: ajv.compile(tableSchema['bigText']),
    tinyInt: ajv.compile(tableSchema['tinyInt']),
    smallInt: ajv.compile(tableSchema['smallInt']),
    mediumInt: ajv.compile(tableSchema['mediumInt']),
    int: ajv.compile(tableSchema['int']),
    bigInt: ajv.compile(tableSchema['bigInt']),
    float: ajv.compile(tableSchema['float']),
    double: ajv.compile(tableSchema['double'])
};

export const checkTable = async (trx) => {
    try {
        // 所有的表数据
        const allDbTable = [];
        // 所有表文件
        const sysDbFiles = readdirSync(resolve(appConfig.funpiDir, 'tables'));
        const appDbFiles = readdirSync(resolve(appConfig.appDir, 'tables'));
        const allDbFiles = [
            //
            ...sysDbFiles.map((file) => {
                return {
                    prefix: 'sys_',
                    file: resolve(appConfig.funpiDir, 'tables', file)
                };
            }),
            ...appDbFiles.map((file) => {
                return {
                    prefix: '',
                    file: resolve(appConfig.appDir, 'tables', file)
                };
            })
        ];

        let hasFieldTypeError = false;

        for (let item of allDbFiles) {
            const pureFileName = basename(item.file, '.js');
            if (/^[a-z][a-zA-Z0-9_]*$/.test(pureFileName) === false) {
                console.log(`${log4state('warn')} ${item.file} 文件名只能为 大小写字母+数字+下划线`);
                process.exit();
            }
            const tableFile = item.prefix + es_snakeCase(pureFileName.trim());
            if (!item.prefix && tableFile.startsWith('sys_') === true) {
                console.log(`${log4state('warn')} ${item.file} 非系统表不能以 sys_ 开头`);
                process.exit();
            }
            const { tableName } = await fnImport(item.file, 'tableName', '');
            const { tableData } = await fnImport(item.file, 'tableData', {});

            if (!tableName) {
                console.log(`${log4state('warn')} ${item.file} 文件的 tableName 必须有表名称`);
                process.exit();
            }

            if (tableName.endsWith('_temp')) {
                console.log(`${log4state('warn')} ${item.file} 文件名不能以 _temp 结尾`);
                process.exit();
            }

            if (es_isPlainObject(tableData) === false) {
                console.log(`${log4state('warn')} ${item.file} 文件的 tableData 必须为普通对象`);
                process.exit();
            }

            if (yd_is_arrayContain(Object.keys(tableData), denyFields) === true) {
                console.log(`${log4state('warn')} ${item.file} 文件的 tableData 不能包含 ${denyFields} 字段`);
                process.exit();
            }

            if (tableFile === 'sys_user' && !tableData.test_field) {
                console.log(`${log4state('warn')} ${item.file} 文件的 tableData 必须有一个test_field 测试字段`);
                process.exit();
            }
            const fieldErrors = [];

            for (let key in tableData) {
                if (Object.prototype.hasOwnProperty.call(tableData, key)) {
                    const field = tableData[key];

                    // 检查属性名是否符合规范
                    if (/^[a-z][a-z0-9_]*$/.test(key) === false) {
                        hasFieldTypeError = true;
                    }

                    // 检查类型是否正确
                    if (fieldTypes.includes(field.type) === false) {
                        fieldErrors.push(`tableData.${key}.type=${field.type} 错误`);
                        hasFieldTypeError = true;
                    }

                    const validateTable = validate[field.type];
                    const validResult = validateTable(field);
                    if (!validResult) {
                        hasFieldTypeError = true;
                        ajvZh(validateTable.errors);
                        const ajvError = log4state('error') + ' ' + ajv.errorsText(validateTable.errors, { separator: '\n' });
                        fieldErrors.push(ajvError);
                    }
                }
            }

            if (hasFieldTypeError) {
                console.log(`${log4state('warn')} ${item.file} 文件`);
                console.log(fieldErrors.join('\r\n'));
            }

            allDbTable.push({
                tableFile: tableFile,
                tableName: (tableName + '表').replace('表表', '表'),
                tableData: tableData
            });
        }
        if (hasFieldTypeError) {
            process.exit();
        } else {
            console.log(`${log4state('success')} 所有表定义正常`);
            return allDbTable;
        }
    } catch (err) {
        console.log('🚀 ~ syncMysql ~ err:', err);
        if (trx) {
            await trx.rollback();
            await trx.destroy();
        }
        console.log(`${log4state('error')} ${appConfig.mysql.db} 数据库表定义错误`);
        process.exit();
    }
};
