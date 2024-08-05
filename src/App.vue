<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {ref} from 'vue';
const locale = ref(zhCn);
</script>

<template>
  <el-config-provider :locale="locale">
      <router-view />
</el-config-provider>
</template>

<style scoped>
html, body, #app {
  height: 100vh;
  margin: 0;
  padding: 0;
}


html {
  overflow-y: hidden;
}
</style>



