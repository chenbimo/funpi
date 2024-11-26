<template>
    <div class="page-index">
        <a-form :model="$Data.formData" layout="vertical">
            <a-form-item field="thumbnail" label="图片上传">
                <input type="file" @change="$Method.onUploadFile" />
                <div class="image-lists">
                    <a-image v-if="$Data.formData.thumbnail" width="200" :src="$Data.formData.thumbnail" />
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup>
// 选项集
defineOptions({
    name: 'index'
});

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集
const $Router = useRouter();

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
    initData() {},
    // 上传文件
    async onUploadFile(event) {
        try {
            const fileObject = event.target.files[0];
            const formData = new FormData();
            formData.append('file', fileObject);
            formData.append('dir', 'version');
            const res = await $Http({
                url: '/upload/local',
                data: formData
            });
            $Data.formData.url = res.url;
        } catch (err) {
            console.log(err);
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-user {
}
</style>
