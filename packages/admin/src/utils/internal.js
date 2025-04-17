// 获取资源
export function utilInternalAssets(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
}

export const utilArrayToTree = (arrs, id = 'id', pid = 'pid', children = 'children', forceChildren = true) => {
    // 输入验证
    if (!Array.isArray(arrs) || arrs.length === 0) {
        return [];
    }

    // 使用 Map 存储项目，并创建副本避免修改原始数据
    const idMap = new Map();
    arrs.forEach((item) => {
        // 创建每个项目的副本
        idMap.set(item[id], { ...item });
    });

    const treeData = [];

    // 构建树结构
    idMap.forEach((item) => {
        const parentId = item[pid];
        const parent = idMap.get(parentId);

        if (parent) {
            // 添加到父项的子列表
            if (!parent[children]) {
                parent[children] = [];
            }
            parent[children].push(item);
        } else {
            // 根节点
            if (forceChildren && !item[children]) {
                item[children] = [];
            }
            treeData.push(item);
        }
    });

    return treeData;
};
