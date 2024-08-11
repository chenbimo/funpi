export const tableName = '邮件日志表';
export const tableData = {
    login_email: {
        name: '登录邮箱',
        type: 'string',
        default: '',
        max: 100
    },
    from_name: {
        name: '发送者昵称',
        type: 'string',
        default: '',
        max: 100
    },
    from_email: {
        name: '发送者邮箱',
        type: 'string',
        default: '',
        max: 100
    },
    to_email: {
        name: '接收者邮箱',
        type: 'string',
        default: '',
        max: 5000
    },
    email_type: {
        name: '邮件类型',
        type: 'string',
        default: 'common',
        min: 1,
        max: 100
    },
    email_code: {
        name: '邮件识别码',
        type: 'string',
        min: 1,
        max: 100,
        default: ''
    },
    text_content: {
        name: '发送内容',
        type: 'string',
        default: '',
        max: 10000
    }
};
