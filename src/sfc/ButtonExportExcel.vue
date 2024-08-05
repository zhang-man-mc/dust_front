<!-- 
    导出成Excel组件

    **父组件
   <ButtonExportExcel  content="导出数据" type="success" :loading="exportButton" @do-export="exportDom"></ButtonExportExcel>
 -->
<script>
export default {
    props: {
        // 按钮文字
        content: {
            type: String,
            default: '导出数据'
        },
        // 按钮样式
        type: {
            type: String,
            default: 'success'
        },
        // 加载效果
        loading: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'default'
        }
    },
    emits: ['doExport'],
}
</script>

<template>
    <el-button :type="type" :size="size" @click="$emit('doExport')" :loading="loading"  >
        <el-icon >
            <i-ep-Download/>
        </el-icon>
        {{ content }}
    </el-button>
</template>
<style scoped>
   .el-icon {
        margin-right: 6px;
        margin-bottom:2px;
        font-size: 1.2em;
    }

</style>