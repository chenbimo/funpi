export const tableName = '字典数据表';
export const tableData = {
    category_id: {
        name: '分类ID',
        type: 'bigInt',
        default: 0,
        isIndex: true,
        min: 0
    },
    category_code: {
        name: '分类编码',
        type: 'string',
        default: '',
        isIndex: true,
        max: 50,
        pattern: '^[a-z][a-z0-9_-]*$'
    },
    code: {
        name: '字典编码',
        type: 'string',
        default: '',
        max: 50,
        pattern: '^[a-z][a-z0-9_-]*$'
    },
    name: {
        name: '字典名称',
        type: 'string',
        default: '',
        max: 100
    },
    value: {
        name: '字典值',
        type: 'string',
        default: '',
        max: 1000
    },
    symbol: {
        name: '数字类型或字符串类型',
        type: 'string',
        default: '',
        enum: ['string', 'number']
    },
    sort: {
        name: '字典排序',
        type: 'bigInt',
        default: 0,
        min: 0
    },
    describe: {
        name: '描述',
        type: 'string',
        default: '',
        max: 500
    },
    thumbnail: {
        name: '缩略图',
        type: 'string',
        default: '',
        max: 500
    }
};
