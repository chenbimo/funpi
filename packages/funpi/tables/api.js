export const tableName = '系统接口表';
export const tableData = {
    pid: {
        name: '父级ID',
        type: 'bigInt',
        default: 0,
        isIndex: true,
        min: 1
    },
    pids: {
        name: '父级ID链',
        type: 'string',
        default: '0',
        max: 1000
    },
    name: {
        name: '名称',
        type: 'string',
        default: '',
        max: 100
    },
    value: {
        name: '值',
        type: 'string',
        default: '',
        max: 500
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
    state: {
        name: '状态 0 正常 1 白名单 2 黑名单',
        type: 'int',
        default: 0,
        enum: [0, 1, 2]
    }
};
