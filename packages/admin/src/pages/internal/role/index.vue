<template>
    <div class="page-role page-full">
        <div class="page-action">
            <div class="left">
                <a-button type="primary" @click="$Method.onDataAction('insertData', {})">添加</a-button>
            </div>
            <div class="right">
                <a-input v-model="$Data.formData.keyword" placeholder="请输入搜索关键字" allow-clear @clear="$Method.apiSelectData"></a-input>
                <div class="w-10px"></div>
                <a-button type="primary" @click="$Method.apiSelectData">搜索</a-button>
            </div>
        </div>
        <div class="page-table">
            <a-table :data="$Data.tableData" :scroll="$GlobalData.tableScroll" :pagination="false" :bordered="$GlobalData.tableBordered" row-key="id">
                <template #columns>
                    <a-table-column title="名称" data-index="name" :width="150" fixed="left" ellipsis tooltip></a-table-column>
                    <a-table-column title="编码" data-index="code" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="类型" data-index="is_system" :width="100" ellipsis tooltip>
                        <template #cell="{ record }">
                            <a-tag v-if="record.is_system === 1" color="red">系统角色</a-tag>
                            <a-tag v-else color="blue">普通角色</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="菜单" data-index="menu_ids" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="接口" data-index="api_ids" :width="150" ellipsis tooltip></a-table-column>
                    <a-table-column title="描述" data-index="describe" :min-width="350" ellipsis tooltip></a-table-column>
                    <a-table-column title="创建时间" data-index="created_at2" :width="150"></a-table-column>
                    <a-table-column title="更新时间" data-index="updated_at2" :width="150"></a-table-column>
                    <a-table-column title="操作" fixed="right" :width="100" align="right">
                        <template #cell="{ record }">
                            <a-dropdown position="br" @select="$Method.onDataAction($event, record)">
                                <a-button>操作<icon-down /></a-button>
                                <template #content>
                                    <a-doption value="updateData"><icon-edit />编辑</a-doption>
                                    <a-doption value="deleteData"> <icon-delete />删除</a-doption>
                                </template>
                            </a-dropdown>
                        </template>
                    </a-table-column>
                </template>
            </a-table>
        </div>
        <div class="page-page">
            <div class="left"></div>
            <div class="right">
                <a-pagination v-model:current="$Data.pagination.page" :total="$Data.pagination.total" :default-page-size="$GlobalData.pageLimit" show-total show-jumper @change="$Method.apiSelectData()" />
            </div>
        </div>

        <!-- 编辑数据抽屉 -->
        <editDataDrawer v-if="$Data.isShow.editDataDrawer" v-model="$Data.isShow.editDataDrawer" :actionType="$Data.actionType" :rowData="$Data.rowData" @success="$Method.fnFreshData()"></editDataDrawer>
    </div>
</template>

<script setup>
// 外部集
// 内部集
import editDataDrawer from './components/editDataDrawer.vue';

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集

// 数据集
const $Data = $ref({
    // 显示和隐藏
    isShow: {
        editDataDrawer: false,
        editPermissionDrawer: false
    },
    actionType: 'insertData',
    // 表格数据
    tableData: [],
    // 行数据
    rowData: {},
    // 表单参数
    formData: {
        keyword: ''
    },
    // 分页组件数据
    pagination: {
        page: 1,
        total: 0
    }
});

// 方法集
const $Method = {
    // 初始化数据
    async initData() {
        await $Method.apiSelectData();
    },
    // 触发数据事件
    onDataAction(actionType, rowData) {
        $Data.actionType = actionType;
        $Data.rowData = rowData;

        // 编辑数据
        if ($Data.actionType === 'insertData' || $Data.actionType === 'updateData') {
            $Data.isShow.editDataDrawer = true;
            return;
        }

        // 删除数据
        if ($Data.actionType === 'deleteData') {
            Modal.confirm({
                title: '提示',
                content: '请确认是否删除？',
                modalClass: 'delete-modal-class',
                alignCenter: true,
                onOk() {
                    $Method.apiDeleteData();
                }
            });
        }
    },
    // 刷新数据
    async fnFreshData() {
        await $Method.apiSelectData();
    },
    // 查询用户数据
    async apiSelectData() {
        try {
            const res = await $Http({
                url: '/funpi/admin/roleSelectPage',
                data: {
                    keyword: $Data.formData.keyword,
                    page: $Data.pagination.page,
                    limit: $GlobalData.pageLimit
                }
            });
            $Data.tableData = utilRelativeTime(res.data.rows);
            $Data.pagination.total = res.data.total;
        } catch (err) {
            Message.error({
                content: err.msg || err
            });
        }
    },
    // 删除数据
    async apiDeleteData() {
        try {
            const res = await $Http({
                url: '/funpi/admin/roleDelete',
                data: {
                    id: $Data.rowData.id
                }
            });
            await $Method.apiSelectData();
            Message.success({
                content: res.msg
            });
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
.page-role {
}
</style>
