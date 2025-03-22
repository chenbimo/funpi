<template>
    <a-modal v-model:visible="$Data.visible" :width="$GlobalData.modalShortWidth" body-class="my-modal-class" :esc-to-close="false" :mask-closable="false" :closable="false" unmountOnClose>
        <template #title>
            <template v-if="$Prop.actionType === 'insertData'">添加管理员</template>
            <template v-if="$Prop.actionType === 'updateData'">编辑管理员</template>
        </template>
        <div class="bodyer">
            <a-form :model="$Data.formData" layout="vertical">
                <a-form-item field="name" label="角色">
                    <a-select v-model="$Data.formData.role" @change="$Method.onChangeCategory">
                        <a-option v-for="item in $Data.roleAll" :key="item.id" :value="item.code" :label="item.name"></a-option>
                    </a-select>
                </a-form-item>
                <a-form-item field="username" label="账号">
                    <a-input v-model="$Data.formData.username" placeholder="字母开头+(字母|数字|下划线|短横线)的组合" />
                </a-form-item>
                <a-form-item field="nickname" label="昵称">
                    <a-input v-model="$Data.formData.nickname" placeholder="任何合法的字符" />
                </a-form-item>
                <a-form-item field="password" label="密码">
                    <a-input v-model="$Data.formData.password" type="password" placeholder="不小于6位的字母、数字、下划线和短横线的组合" />
                </a-form-item>
            </a-form>
        </div>
        <template #footer>
            <div class="footer flex justify-center">
                <a-space size="large">
                    <a-button @click="$Method.onClose">取消</a-button>
                    <a-button type="primary" @click="$Method.apiEditData">确定</a-button>
                </a-space>
            </div>
        </template>
    </a-modal>
</template>
<script setup>
// 外部集

// 内部集

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 属性集
const $Prop = defineProps({
    modelValue: {
        type: Boolean
    },
    actionType: {
        type: String,
        default: 'insertData'
    },
    rowData: {
        type: Object,
        default: {}
    },
    category_code: {
        type: String
    },
    categoryAll: {
        type: Array,
        default: []
    }
});

// 事件集
const $Emit = defineEmits(['update:modelValue', 'success', 'changeCategory']);

// 数据集
const $Data = $ref({
    visible: false,
    // 显示和隐藏
    isShow: {},
    // 表单数据
    formData: {
        role: '',
        username: '',
        nickname: '',
        password: ''
    },
    roleAll: []
});

// 方法集
const $Method = {
    async initData() {
        await $Method.apiSelectAllRole();
        $Data.visible = $Prop.modelValue;
        $Data.formData = Object.assign($Data.formData, $Prop.rowData, { password: '' });
    },
    // 关闭抽屉事件
    onClose() {
        $Data.visible = false;
        setTimeout(() => {
            $Emit('update:modelValue', false);
        }, 300);
    },
    // 查询字典分类
    async apiSelectAllRole() {
        try {
            const res = await $Http({
                url: '/funpi/admin/roleSelectAll',
                data: {}
            });
            $Data.roleAll = res.data.rows.filter((item) => item.code !== 'dev');
        } catch (err) {
            Message.error(err.msg || err);
        }
    },
    // 编辑
    async apiEditData() {
        try {
            const url = {
                insertData: '/funpi/admin/adminInsert?t1=d1&t2=d2',
                updateData: '/funpi/admin/adminUpdate'
            }[$Prop.actionType];
            const password = $Data.formData.password.trim();

            const res = await $Http({
                url: url,
                data: {
                    ...$Data.formData,
                    ...{
                        password: !password ? null : password
                    }
                }
            });
            $Method.onClose();
            $Emit('success');
        } catch (err) {
            Message.warning({
                content: err.msg || err
            });
        }
    }
};

$Method.initData();
</script>
