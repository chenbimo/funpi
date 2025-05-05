export const roleConfig = {
    visitor: {
        name: '游客',
        sort: 4,
        describe: '具备有限的权限和有限的查看内容'
    },
    user: {
        name: '用户',
        sort: 3,
        describe: '用户权限和对于的内容查看'
    },
    admin: {
        name: '管理',
        sort: 2,
        describe: '管理权限、除开发相关权限之外的权限等'
    },
    super: {
        name: '超级管理',
        sort: 1,
        describe: '超级管理权限、除开发相关权限之外的权限等'
    }
};
