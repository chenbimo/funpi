<template>
    <a-modal v-model:visible="$Data.visible" :width="$GlobalData.modalShortWidth" body-class="my-modal-class" :esc-to-close="false" :mask-closable="false" :closable="false" unmountOnClose>
        <template #title>
            <template v-if="$Prop.actionType === 'insertData'">添加字典</template>
            <template v-if="$Prop.actionType === 'updateData'">编辑字典</template>
        </template>
        <div class="bodyer">
            <a-form :model="$Data.formData" layout="vertical">
                <a-form-item field="category" label="字典分类">
                    <a-select v-model="$Data.formData.category_id" @change="$Method.onChangeCategory">
                        <a-option v-for="item in $Prop.categoryAll" :key="item.id" :value="item.id" :label="item.name"></a-option>
                    </a-select>
                </a-form-item>
                <a-form-item field="name" label="字典名称">
                    <a-input v-model="$Data.formData.name" placeholder="任何合法的字符" />
                </a-form-item>
                <a-form-item field="code" label="字典编码">
                    <a-input v-model="$Data.formData.code" placeholder="字母开头+(字母|数字|下划线|短横线)的组合" />
                </a-form-item>
                <a-form-item field="value" label="字典值">
                    <a-input v-model="$Data.formData.value" placeholder="必须跟字典类型匹配！" />
                </a-form-item>
                <a-form-item field="symbol" label="字典类型">
                    <a-radio-group v-model="$Data.formData.symbol">
                        <a-radio value="string">字符串</a-radio>
                        <a-radio value="number">数字</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item field="describe" label="字典描述">
                    <a-textarea v-model="$Data.formData.describe" placeholder="长度不超过200个字" :max-length="200" show-word-limit allow-clear />
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
import { keyBy as _keyBy, merge as _merge } from 'es-toolkit';

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
        category_id: '',
        category_code: '',
        code: '',
        name: '',
        value: '',
        symbol: 'string',
        describe: ''
    },
    categoryAllId: {},
    categoryAllCode: {}
});

// 方法集
const $Method = {
    async initData() {
        $Data.visible = $Prop.modelValue;
        $Data.categoryAllId = _keyBy($Prop.categoryAll, (item) => item.id);
        $Data.categoryAllCode = _keyBy($Prop.categoryAll, (item) => item.code);
        $Data.formData.category_id = $Data.categoryAllCode[$Prop.category_code]?.id;
        $Method.setCategoryCode();
        $Data.formData = Object.assign($Data.formData, $Prop.rowData);
    },
    // 关闭抽屉事件
    onClose() {
        $Data.visible = false;
        setTimeout(() => {
            $Emit('update:modelValue', false);
        }, 300);
    },
    // 改变分类
    onChangeCategory() {
        $Method.setCategoryCode();
        $Emit('changeCategory', $Data.formData.category_code);
    },
    setCategoryCode() {
        $Data.formData.category_code = $Data.categoryAllId[$Data.formData.category_id]?.code;
    },
    // 编辑
    async apiEditData() {
        try {
            const url = {
                insertData: '/funpi/dict/dictInsert',
                updateData: '/funpi/dict/dictUpdate'
            }[$Prop.actionType];

            $Method.setCategoryCode();

            const res = await $Http({
                url: url,
                data: $Data.formData
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
