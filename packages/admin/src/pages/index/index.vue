<template>
    <div class="page-index"></div>
</template>

<script setup>
// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集

// 数据集
const $Data = $ref({
    // 显示和隐藏
    isShow: {},
    formData: {
        thumbnail: ''
    }
});

// 方法集
const $Method = {
    initData() {}
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-user {
}
</style>
