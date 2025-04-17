<template>
    <div class="page-api page-full">
        <div class="page-action">
            <div class="left">
                <div class="common-badge">
                    <div class="label">接口总数</div>
                    <div class="value">{{ $Data.apiTotal }}个</div>
                </div>
            </div>
            <div class="right">
                <a-input placeholder="请输入搜索关键字" allow-clear></a-input>
                <div class="w-10px"></div>
                <a-button type="primary">搜索</a-button>
            </div>
        </div>
        <div class="page-table no-page">
            <a-table :data="$Data.tableData" :scroll="$GlobalData.tableScroll" :pagination="false" :bordered="$GlobalData.tableBordered" row-key="id" :expanded-keys="$Data.apiIds" hide-expand-button-on-empty>
                <template #columns>
                    <a-table-column title="名称" data-index="name" :width="250" ellipsis tooltip></a-table-column>
                    <a-table-column title="路由" data-index="value" :width="300" ellipsis tooltip></a-table-column>
                    <a-table-column title="排序" data-index="sort" :width="80" ellipsis tooltip></a-table-column>
                    <a-table-column title="ID" data-index="id" :width="180" ellipsis tooltip></a-table-column>
                    <a-table-column title="描述" data-index="describe" ellipsis tooltip></a-table-column>
                    <a-table-column title="创建时间" data-index="created_at2" :width="150"></a-table-column>
                    <a-table-column title="更新时间" data-index="updated_at2" :width="150"></a-table-column>
                </template>
            </a-table>
        </div>
    </div>
</template>

<script setup>
// 外部集
import { sortBy as _sortBy } from 'es-toolkit';

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集

// 数据集
const $Data = $ref({
    pagination: {
        page: 1,
        total: 0
    },
    // 接口总数
    apiTotal: '',
    apiIds: [],
    // 列表数据
    tableData: []
});

// 方法集
const $Method = {
    async initData() {
        await $Method.apiSelectData();
    },
    async onStateAction(actionType, rowData) {
        $Data.actionType = actionType;
        $Data.rowData = rowData;
        const res = await $Http({
            url: '/funpi/admin/apiUpdateState',
            data: {
                id: rowData.id,
                state: actionType
            }
        });
        await $Method.apiSelectData();
    },
    // 查询用户数据
    async apiSelectData() {
        try {
            const res = await $Http({
                url: '/funpi/admin/apiSelectAll',
                data: {
                    page: $Data.pagination.page,
                    limit: $GlobalData.pageLimit
                }
            });
            $Data.apiTotal = res.data.rows?.length || '';
            $Data.apiIds = res.data.rows?.map((item) => item.id) || [];
            $Data.tableData = utilArrayToTree(_sortBy(utilRelativeTime(res.data.rows), 'sort'));
        } catch (err) {
            Message.error({
                content: err.msg || err
            });
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-api {
}
</style>
