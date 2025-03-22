<template>
    <a-modal v-model:visible="$Data.visible" :width="$GlobalData.modalShortWidth" body-class="my-modal-class" :esc-to-close="false" :mask-closable="false" :closable="false" unmountOnClose>
        <template #title> 发送邮件 </template>
        <div class="bodyer">
            <a-form :model="$Data.formData" layout="vertical">
                <a-form-item field="email_type" label="邮件类型">
                    <a-radio-group v-model="$Data.formData.email_type">
                        <a-radio value="common">普通邮件</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item field="to_email" label="接收者">
                    <a-input v-model="$Data.formData.to_email" placeholder="1个或多个邮箱地址，用逗号隔开" />
                </a-form-item>
                <a-form-item field="subject" label="邮件主题">
                    <a-input v-model="$Data.formData.subject" placeholder="不超过200个字符" />
                </a-form-item>
                <a-form-item v-if="$Data.formData.email_type === 'common'" field="content" label="发送内容">
                    <a-textarea v-model="$Data.formData.content" placeholder="长度不超过10000个字符" :max-length="10000" show-word-limit allow-clear />
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
    }
});

// 事件集
const $Emit = defineEmits(['update:modelValue', 'success']);

// 数据集
const $Data = $ref({
    visible: false,
    // 表单数据
    formData: {
        email_type: 'common',
        to_email: '',
        subject: '',
        verify_name: '',
        content: ''
    }
});

// 方法集
const $Method = {
    async initData() {
        $Data.visible = $Prop.modelValue;
    },
    // 关闭抽屉事件
    onClose() {
        $Data.visible = false;
        setTimeout(() => {
            $Emit('update:modelValue', false);
        }, 300);
    },
    // 编辑
    async apiEditData() {
        try {
            const formData = {
                email_type: $Data.formData.email_type,
                to_email: $Data.formData.to_email,
                subject: $Data.formData.subject
            };
            if ($Data.formData.email_type === 'common') {
                formData.content = $Data.formData.content;
            }
            if ($Data.formData.email_type === 'verify') {
                formData.verify_name = $Data.formData.verify_name;
            }
            const res = await $Http({
                url: '/funpi/tool/sendMail',
                data: formData
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
