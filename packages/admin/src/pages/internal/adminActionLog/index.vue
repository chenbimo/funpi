<template>
    <div class="page-admin page-full">
        <div class="page-action">
            <div class="left"></div>
            <div class="right">
                <a-input placeholder="请输入搜索关键字" allow-clear></a-input>
                <div class="w-10px"></div>
                <a-button type="primary">搜索</a-button>
            </div>
        </div>
        <div class="page-table">
            <a-table :data="$Data.tableData" :scroll="$GlobalData.tableScroll" :pagination="false" :bordered="$GlobalData.tableBordered" row-key="id">
                <template #columns>
                    <a-table-column title="用户名" data-index="username" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="昵称" data-index="nickname" :width="200" ellipsis tooltip></a-table-column>
                    <a-table-column title="角色" data-index="role" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="接口" data-index="api" :width="300" ellipsis tooltip></a-table-column>
                    <a-table-column title="参数" data-index="params" :min-width="300" ellipsis tooltip></a-table-column>
                    <a-table-column title="操作时间" data-index="created_at2" :width="150"></a-table-column>
                    <a-table-column title="IP地址" data-index="ip" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="UA" data-index="ua" :width="300" ellipsis tooltip></a-table-column>
                </template>
            </a-table>
        </div>
        <div class="page-page">
            <div class="left"></div>
            <div class="right">
                <a-pagination v-model:current="$Data.pagination.page" :total="$Data.pagination.total" :default-page-size="$GlobalData.pageLimit" show-total show-jumper @change="$Method.apiSelectData()" />
            </div>
        </div>
    </div>
</template>

<script setup>
// 外部集

// 内部集

// 外部集

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集

// 数据集
const $Data = $ref({
    // 显示和隐藏
    isShow: {
        editDataDrawer: false
    },
    actionType: 'insertData',
    tableData: [],
    rowData: {},
    pagination: {
        page: 1,
        total: 0
    }
});

// 方法集
const $Method = {
    async initData() {
        await $Method.apiSelectData();
    },
    // 触发数据事件
    onDataAction(actionType, rowData) {
        $Data.actionType = actionType;
        $Data.rowData = rowData;
    },
    // 刷新数据
    async fnFreshData() {
        $Method.apiSelectData();
    },
    // 查询用户数据
    async apiSelectData() {
        try {
            const res = await $Http({
                url: '/funpi/admin/adminActionLogSelectPage',
                data: {
                    page: $Data.pagination.page,
                    limit: $GlobalData.pageLimit
                }
            });
            $Data.tableData = utilRelativeTime(res.data.rows);
            $Data.pagination.total = res.data.total;
        } catch (err) {
            console.log('🚀 ~ file: index.vue:86 ~ apiSelectData ~ err:', err);
            Message.error(err.msg || err);
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-admin {
}
</style>
