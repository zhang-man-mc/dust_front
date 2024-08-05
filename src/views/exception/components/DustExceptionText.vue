<!-- 扬尘 异常文本按钮 点击查该店铺某时段的异常数据

**父组件
将该站点某时段的异常数据返回给父组件，父组件再返回给祖先组件
-->
<script>
import exceptionApi from '@/api/exceptionApi.js';
export default {
  props: {
    siteName: String,
    exceptionType: String,
    beginTime: String,
    endTime: String,
    
  },
  emits: ['submitExceptionData'],
  data() {
    return {
      //某个异常类型的全部数据
      // exceptionData:[]
    };
  },

  methods: {
    requestExceptionData() {
      // 不分页
      exceptionApi
        .exceptiondata1({
          siteName:  this.siteName,
          exceptionType:this.exceptionType,
          beginTime:this.beginTime,
          endTime:this.endTime
        }
        )
        .then((result) => {
          //将返回的结果传递给父组件
          this.$emit('submitExceptionData', result.data.data);
        });
    }
  }
};
</script>

<template>
  <el-link @click="requestExceptionData" class="text"><slot /></el-link>
</template>

<style lang="scss" scoped>
.text {
  color: #333333;
  font-size: 14px;
}

</style>
