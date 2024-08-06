export const tableFieldSchemaMap = {
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
