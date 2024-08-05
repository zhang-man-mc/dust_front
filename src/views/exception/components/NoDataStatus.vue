<!-- 自定义的无数据状态 样式 -->
<script>
  export default {
    props:{
    isNoData:{
        type:Boolean,
        default:()=>{
            return true
        }
    }
},
}
</script>

<template>
  <div class="container" v-show="isNoData">
    <span>暂无数据</span>
  </div>
</template>

<style  scoped>
.container {
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;

    color: gray;
}

</style>