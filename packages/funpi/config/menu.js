export const menuConfig = {
    '/admin': {
        name: '管理数据',
        sort: 1,
        is_system: 1,
        children: {
            '/internal/admin': {
                name: '管理员',
                is_system: 1,
                sort: 1
            }
        }
    },
    '/dict': {
        name: '字典管理',
        sort: 2,
        is_system: 1,
        children: {
            '/internal/dict-category': {
                name: '字典分类',
                is_system: 1,
                sort: 1
            },
            '/internal/dict': {
                name: '字典列表',
                is_system: 1,
                sort: 2
            }
        }
    },
    '/log': {
        name: '日志数据',
        sort: 2,
        is_system: 1,
        children: {
            '/internal/admin-login-log': {
                name: '登录日志',
                is_system: 1,
                sort: 1
            },
            '/internal/admin-action-log': {
                name: '操作日志',
                is_system: 1,
                sort: 2
            },
            '/internal/mail-log': {
                name: '邮件日志',
                is_system: 1,
                sort: 3
            }
        }
    },
    '/permission': {
        name: '权限数据',
        sort: 4,
        children: {
            '/internal/menu': {
                name: '菜单列表',
                is_system: 1,
                sort: 1
            },
            '/internal/api': {
                name: '接口列表',
                is_system: 1,
                sort: 2
            },
            '/internal/role': {
                name: '角色管理',
                is_system: 1,
                sort: 3
            }
        }
    }
};
