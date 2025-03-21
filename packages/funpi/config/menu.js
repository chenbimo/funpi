export const menuConfig = [
    {
        path: '/admin',
        name: '管理数据',
        children: [
            {
                path: '/internal/admin',
                name: '管理员'
            }
        ]
    },
    {
        path: '/dict',
        name: '字典管理',
        children: [
            {
                path: '/internal/dict-category',
                name: '字典分类'
            },
            {
                path: '/internal/dict',
                name: '字典列表'
            }
        ]
    },
    {
        path: '/log',
        name: '日志数据',
        children: [
            {
                path: '/internal/admin-login-log',
                name: '登录日志'
            },
            {
                path: '/internal/admin-action-log',
                name: '操作日志'
            },
            {
                path: '/internal/mail-log',
                name: '邮件日志'
            }
        ]
    },
    {
        path: '/permission',
        name: '权限数据',
        children: [
            {
                path: '/internal/menu',
                name: '菜单列表'
            },
            {
                path: '/internal/api',
                name: '接口列表'
            },
            {
                path: '/internal/role',
                name: '角色管理'
            }
        ]
    }
];
