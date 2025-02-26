export const tableName = '管理员操作日志表';
export const tableData = {
    user_id: {
        name: '登录用户ID',
        type: 'bigInt',
        default: 0,
        isIndex: true,
        min: 0
    },
    username: {
        name: '用户名',
        type: 'string',
        default: '',
        max: 50
    },
    nickname: {
        name: '昵称',
        type: 'string',
        default: '',
        max: 50
    },
    role: {
        name: '角色',
        type: 'string',
        default: '',
        max: 50
    },
    ip: {
        name: 'ip',
        type: 'string',
        default: '',
        max: 50
    },
    ua: {
        name: 'ua',
        type: 'string',
        default: '',
        max: 500
    },
    api: {
        name: '访问接口',
        type: 'string',
        default: '',
        max: 200
    },
    params: {
        name: '请求参数',
        type: 'string',
        default: '',
        max: 5000
    }
};
