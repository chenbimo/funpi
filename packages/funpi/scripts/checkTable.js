#!/usr/bin/env node
// 内部模块
import { basename, resolve } from 'pathe';
import { readdirSync } from 'node:fs';
import { randomInt } from 'node:crypto';
// 外部模块
import Knex from 'knex';
import Ajv from 'ajv';
import { isPlainObject as es_isPlainObject, snakeCase as es_snakeCase } from 'es-toolkit';
import { isObject as es_isObject } from 'es-toolkit/compat';
// 配置文件

import { appDir, funpiDir } from '../config/path.js';
import { tableSchema } from '../schema/table.js';
import { ajvZh } from '../utils/ajvZh.js';
import { fnImport, log4state, fnArrayContain, fnArrayDiffBoth } from '../utils/index.js';
import { colors } from '../utils/colors.js';

const ajv = new Ajv({
    strict: false,
    allErrors: true,
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
        const sysDbFiles = readdirSync(resolve(funpiDir, 'tables'));
        const appDbFiles = readdirSync(resolve(appDir, 'tables'));
        const allDbFiles = [
            //
            ...sysDbFiles.map((file) => {
                return {
                    prefix: 'sys_',
                    file: resolve(funpiDir, 'tables', file)
                };
            }),
            ...appDbFiles.map((file) => {
                return {
                    prefix: '',
                    file: resolve(appDir, 'tables', file)
                };
            })
        ];

        let isAllFileError = false;
        let thisFile = '';
        for (let item of allDbFiles) {
            thisFile = item.file;
            let isThisFileError = false;
            const fieldErrors = [];
            const pureFileName = basename(item.file, '.js');
            if (/^[a-z][a-zA-Z0-9_]*$/.test(pureFileName) === false) {
                fieldErrors.push(`${log4state('error')} 文件名只能为 小写字母+[大小写字母+数字+下划线]`);
                isAllFileError = true;
                isThisFileError = true;
            }
            const tableFile = item.prefix + es_snakeCase(pureFileName.trim());
            if (!item.prefix && tableFile.startsWith('sys_') === true) {
                fieldErrors.push(`${log4state('error')} 非系统表不能以 sys_ 开头`);
                isAllFileError = true;
                isThisFileError = true;
            }
            const { tableName } = await fnImport(item.file, 'tableName', '');
            const { tableData } = await fnImport(item.file, 'tableData', {});

            if (!tableName) {
                fieldErrors.push(`${log4state('error')} tableName 必须有表名称`);
                isAllFileError = true;
                isThisFileError = true;
            }

            if (tableName.endsWith('_temp')) {
                fieldErrors.push(`${log4state('error')} 文件名不能以 _temp 结尾`);
                isAllFileError = true;
                isThisFileError = true;
            }

            if (es_isPlainObject(tableData) === false) {
                fieldErrors.push(`${log4state('error')} tableData 必须为普通对象`);
                isAllFileError = true;
                isThisFileError = true;
            }

            if (fnArrayContain(Object.keys(tableData), denyFields) === true) {
                fieldErrors.push(`${log4state('error')} tableData 不能包含 ${denyFields} 字段`);
                isAllFileError = true;
                isThisFileError = true;
            }

            if (tableFile === 'sys_user' && !tableData.test_field) {
                fieldErrors.push(`${log4state('error')} tableData 必须有一个test_field 测试字段`);
                isAllFileError = true;
                isThisFileError = true;
            }

            for (let key in tableData) {
                if (Object.prototype.hasOwnProperty.call(tableData, key)) {
                    const field = tableData[key];

                    // 检查属性名是否符合规范
                    if (/^[a-z][a-z0-9_]*$/.test(key) === false) {
                        isAllFileError = true;
                        isThisFileError = true;
                    }

                    // 检查类型是否正确
                    if (fieldTypes.includes(field.type) === false) {
                        fieldErrors.push(`${log4state('error')} tableData.${key}.type=${field.type} 字段类型错误`);
                        isAllFileError = true;
                        isThisFileError = true;
                    }

                    if (isThisFileError === false) {
                        const validateTable = validate[field.type];
                        const validResult = validateTable(field);
                        if (!validResult) {
                            isAllFileError = true;
                            isThisFileError = true;
                            ajvZh(validateTable.errors);
                            ajv.errorsText(validateTable.errors, { dataVar: key })
                                ?.split(',')
                                ?.forEach((str) => {
                                    fieldErrors.push(`${log4state('error')} ${str.trim()}`);
                                });
                        }
                    }
                }
            }

            if (isThisFileError) {
                console.log(`${log4state('warn')} ${thisFile} 文件`);
                console.log(fieldErrors.filter((v) => !!v?.trim()).join('\r\n'));
            }

            allDbTable.push({
                tableFile: tableFile,
                tableName: (tableName + '表').replace('表表', '表'),
                tableData: tableData
            });
        }
        if (isAllFileError) {
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
        console.log(`${log4state('error')} ${Bun.env.MYSQL_DB} 数据库表定义错误`);
        process.exit();
    }
};
