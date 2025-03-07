// {
//     name: { title: '字段名称', type: 'string' },
//     default: { title: '默认值', type: ['string', 'integer', 'number'] },
//     isIndex: { title: '是否索引', type: 'boolean', default: false },
//     isUnique: { title: '是否唯一', type: 'boolean', default: false },
//     isUnsigned: { title: '是否无符号', type: 'boolean', default: false },
//     precision: { title: '整数精度', type: 'integer', minimum: 0, default: 8 },
//     scale: { title: '小数精度', type: 'integer', minimum: 0, default: 2 },
//     default2: { title: '默认值', type: ['string', 'integer', 'number'] },
//     min: { title: '最小长度', type: 'integer', minimum: 0 },
//     max: { title: '最大长度', type: 'integer' },
//     enum: { title: '枚举值', type: 'array' },
//     pattern: { title: '模式匹配', type: 'string' },
//     multipleOf: { title: '倍数', type: 'integer', minimum: 1 }
// }

// 字符串
const schema = {
    string: {
        name: { title: '字段名称', type: 'string' },
        default: { title: '默认值', type: 'string' },
        isIndex: { title: '是否索引', type: 'boolean', default: false },
        isUnique: { title: '是否唯一', type: 'boolean', default: false },
        default2: { title: '默认值', type: 'string' },
        min: { title: '最小长度', type: 'integer', minimum: 0 },
        max: { title: '最大长度', type: 'integer' },
        enum: { title: '枚举值', type: 'array' },
        pattern: { title: '模式匹配', type: 'string' }
    },
    text: {
        name: { title: '字段名称', type: 'string' },
        default2: { title: '默认值', type: 'string' },
        default: { title: '默认值', type: 'string' },
        min: { title: '最小长度', type: 'integer', minimum: 0 },
        max: { title: '最大长度', type: 'integer' },
        enum: { title: '枚举值', type: 'array' },
        pattern: { title: '模式匹配', type: 'string' }
    },
    int: {
        name: { title: '字段名称', type: 'string' },
        default: { title: '默认值', type: 'integer' },
        isIndex: { title: '是否索引', type: 'boolean', default: false },
        isUnique: { title: '是否唯一', type: 'boolean', default: false },
        isUnsigned: { title: '是否无符号', type: 'boolean', default: false },
        default2: { title: '默认值', type: 'integer' },
        min: { title: '最小长度', type: 'integer', minimum: 0 },
        max: { title: '最大长度', type: 'integer' },
        enum: { title: '枚举值', type: 'array' },
        multipleOf: { title: '倍数', type: 'integer', minimum: 1 }
    },
    dot: {
        name: { title: '字段名称', type: 'string' },
        default: { title: '默认值', type: 'number' },
        isIndex: { title: '是否索引', type: 'boolean', default: false },
        isUnique: { title: '是否唯一', type: 'boolean', default: false },
        isUnsigned: { title: '是否无符号', type: 'boolean', default: false },
        precision: { title: '整数精度', type: 'integer', minimum: 0, default: 8 },
        scale: { title: '小数精度', type: 'integer', minimum: 0, default: 2 },
        default2: { title: '默认值', type: 'number' },
        min: { title: '最小长度', type: 'integer', minimum: 0 },
        max: { title: '最大长度', type: 'integer' },
        enum: { title: '枚举值', type: 'array' },
        multipleOf: { title: '倍数', type: 'integer', minimum: 1 }
    }
};

export const tableSchema = {
    string: {
        title: '字符串类型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'string'
            },
            ...schema.string
        },
        additionalProperties: false
    },
    text: {
        title: '普通文本类型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'text'
            },
            ...schema.text
        },
        additionalProperties: false
    },
    mediumText: {
        title: '中文本类型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'mediumText'
            },
            ...schema.text
        },
        additionalProperties: false
    },
    bigText: {
        title: '长文本类型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'bigText'
            },
            ...schema.text
        },
        additionalProperties: false
    },
    tinyInt: {
        title: '微整型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'tinyInt'
            },
            ...schema.int
        },
        additionalProperties: false
    },
    smallInt: {
        title: '小整型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'smallInt'
            },
            ...schema.int
        },
        additionalProperties: false
    },
    mediumInt: {
        title: '中整型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'mediumInt'
            },
            ...schema.int
        },
        additionalProperties: false
    },
    int: {
        title: '普通整型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'int'
            },
            ...schema.int
        },
        additionalProperties: false
    },
    bigInt: {
        title: '大整型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'bigInt'
            },
            ...schema.int
        },
        additionalProperties: false
    },
    float: {
        title: '浮点型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'float'
            },
            ...schema.dot
        },
        additionalProperties: false
    },
    double: {
        title: '双精度型',
        type: 'object',
        properties: {
            type: {
                title: '数据类型',
                const: 'double'
            },
            ...schema.dot
        },
        additionalProperties: false
    }
};
