import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, basename } from 'node:path';
import { cwd } from 'node:process';
import colors from 'picocolors';
import { isString as es_isString, isFunction as es_isFunction, omit as es_omit } from 'es-toolkit';
import { isObject as es_isObject } from 'es-toolkit/compat';
import { yd_misc_4StateSymbol } from 'yidash';
import { yd_crypto_md5 } from 'yidash/node';

// 字段协议映射
const tableFieldSchemaMap = {
    // 字符串型
    string: 'string',
    // 文本型
    mediumText: 'string',
    text: 'string',
    bigText: 'string',
    // 整型
    tinyInt: 'integer',
    smallInt: 'integer',
    mediumInt: 'integer',
    int: 'integer',
    bigInt: 'integer',
    // 浮点型
    float: 'number',
    // 双精度型
    double: 'number'
};

export const system = {
    appDir: cwd(),
    funpiDir: dirname(import.meta.filename)
};

export const fnFormatNow = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

//  检查传参有效性
export function fnApiCheck(req) {
    return new Promise((resolve, reject) => {
        const fields = req.body;

        const fieldsParams = es_omit(fields, ['sign']);

        if (Object.keys(fieldsParams).length === 0) {
            return resolve({ code: 0, msg: '接口未带参数' });
        }

        if (!fieldsParams.t) {
            return reject({ code: 1, msg: '接口请求时间无效' });
        }

        const diffTime = Date.now() - Number(fieldsParams.t);
        if (diffTime > 3 * 60 * 1000) {
            return reject({ code: 1, msg: '接口请求时间已过期' });
        }

        const fieldsArray = [];
        for (let key in fieldsParams) {
            if (Object.prototype.hasOwnProperty.call(fieldsParams, key)) {
                const value = fieldsParams[key];
                if (value !== undefined && value !== null) {
                    fieldsArray.push(`${key}=${value}`);
                }
            }
        }

        const fieldsSort = fieldsArray.sort().join('&');

        const fieldsMd5 = yd_crypto_md5(fieldsSort);

        if (fieldsMd5 !== fields.sign) {
            return reject({ code: 1, msg: '接口请求参数校验失败', detail: { sign: fieldsMd5, sort: fieldsSort } });
        }

        return resolve({ code: 0, msg: '接口参数正常' });
    });
}

// 获取接口信息
export function fnApiInfo(metaUrl) {
    const _filename = fileURLToPath(metaUrl);
    const _dirname = dirname(_filename);

    const pureFileName = basename(_filename, '.js');

    const parentDirName = _dirname.replace(/\\+/gi, '/').replace(/.+\/apis/, '');

    // const metaFile = dirname(metaUrl) + '/_meta.js';

    const apiData = {
        pureFileName: pureFileName,
        parentDirName: parentDirName,
        apiPath: [parentDirName, pureFileName].join('/')
    };

    return apiData;
}

// 获取数据库字段
export const fnField = (tableData, exclude = []) => {
    const defaultFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
    const selectFields = Object.keys(tableData).filter((field) => {
        const isPass = !exclude.includes(field);
        return isPass;
    });
    return [...defaultFields, ...selectFields];
};

// 导入数据
export const fnImport = async (absolutePath, name, defaultValue = {}) => {
    try {
        const data = await import(pathToFileURL(absolutePath));
        return data;
    } catch (err) {
        console.log('🚀 ~ fnImport ~ err:', err);
        return {
            [name]: defaultValue
        };
    }
};

// 设置路由函数
export const fnRoute = (metaUrl, fastify, metaConfig, options) => {
    if (es_isString(metaUrl) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第一个参数必须为 import.meta.url，请检查`);
        process.exit();
    }

    if (es_isObject(fastify) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第二个参数必须为 fastify 实例，请检查`);
        process.exit();
    }

    if (!metaConfig?.dirName) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第三个参数必须为 _meta.js 文件元数据，请检查`);
        process.exit();
    }

    if (es_isObject(options) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第四个参数必须为 Object 对象，请检查`);
        process.exit();
    }

    if (es_isObject(options.schemaRequest) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 schemaRequest 必须为一个对象，请检查`);
        process.exit();
    }
    if (es_isFunction(options.apiHandler) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口的 apiHandler 必须为一个函数，请检查`);
        process.exit();
    }

    const apiInfo = fnApiInfo(metaUrl);
    const method = (options.method || 'post').toLowerCase();

    if (['get', 'post'].includes(method) === false) {
        console.log(`${yd_misc_4StateSymbol('error')} ${colors.blue(metaUrl)} 接口方法只能为 get 或 post 之一，请检查`);
        process.exit();
    }

    options.schemaRequest.title = metaConfig.apiNames[apiInfo.pureFileName];

    const routeParams = {
        method: method,
        url: `/${apiInfo.pureFileName}`,
        schema: {
            summary: metaConfig.apiNames[apiInfo.pureFileName],
            tags: [apiInfo.parentDirName + ' ' + metaConfig.dirName],
            response: options.schemaResponse || {}
        },
        handler: options.apiHandler
    };

    if (routeParams.method === 'get') {
        routeParams.schema.query = options.schemaRequest;
    } else {
        routeParams.schema.body = options.schemaRequest;
    }
    fastify.route(routeParams);
};

export const fnSchema = (field) => {
    if (!field) {
        throw new Error('字段格式错误');
    }
    if (field === 'id') {
        field = {
            name: '主键ID',
            type: 'bigInt',
            min: 1
        };
    }
    if (field === 'page') {
        field = {
            name: '第几页',
            type: 'bigInt',
            default: 1,
            min: 1
        };
    }
    if (field === 'limit') {
        field = {
            name: '每页数量',
            type: 'bigInt',
            default: 20,
            min: 1,
            max: 100
        };
    }
    if (field === 'keyword') {
        field = {
            name: '搜索关键字',
            type: 'string',
            default: '',
            min: 0,
            max: 100
        };
    }
    if (field === 'bool_enum') {
        field = {
            name: '布尔值',
            type: 'tinyInt',
            enum: [0, 1]
        };
    }
    if (field === 'min1') {
        field = {
            name: '最小数字为1',
            type: 'bigInt',
            min: 1
        };
    }
    if (field === 'min0') {
        field = {
            name: '最小数字为0',
            type: 'bigInt',
            min: 0
        };
    }
    const params = {
        title: field.name,
        type: tableFieldSchemaMap[field.type]
    };
    if (field.type === 'string') {
        if (field.default2 !== undefined) {
            params.default = field.default2;
        }
        if (field.min !== undefined) {
            params.minLength = field.min;
        }
        if (field.max !== undefined) {
            params.maxLength = field.max;
        }
        if (field.enum !== undefined) {
            params.enum = field.enum;
        }
        if (field.pattern !== undefined) {
            params.pattern = field.pattern;
        }
    }
    if (field.type === 'integer' || field.type === 'number') {
        if (field.default2 !== undefined) {
            params.default = field.default2;
        }
        if (field.min !== undefined) {
            params.minimum = field.min;
        }
        if (field.max !== undefined) {
            params.maximum = field.max;
        }
        if (field.enum !== undefined) {
            params.enum = field.enum;
        }
        if (field.multipleOf !== undefined) {
            params.multipleOf = field.multipleOf;
        }
    }

    return params;
};
