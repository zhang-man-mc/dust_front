
<script  >
import  AppAside  from "./AppAside.vue";
import  AppHeader from "./AppHeader.vue"
import Content from '@/components/core/Content.vue';
  export default{
    components:[
    AppAside,
    AppHeader,
    Content
    ],
    data(){
      return{

      }
    },
    methods:{

    }

  }
</script>

<template>
    <div class="page-container"> 
    <el-container>
      <AppAside/>
      <el-container class="header-and-main">
        <AppHeader/>
        <el-main >
          <Content></Content>
          <!-- <RouterView/> -->
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>

.header-and-main {
  flex-direction: column;
  height: 100vh;
  // min-width: 1445px;
  min-width: 1475px;
}
/* // 垂直方向溢出区域禁止滚动 */
.el-main {
  background-color: #f4f4f5;
  padding: 0;
}
* {
  font-family: 'KaiGenGothicSC-Light';
}

</style>

