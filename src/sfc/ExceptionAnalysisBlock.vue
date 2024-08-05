<!-- 异常分析模块
显示异常的数值和店铺名。用户点击站点名字会跳转出异常的表格
那么，异常文本返回的数据给这儿，再从这儿返回给祖先组件。
-->
<script>
import DustExceptionText from './DustExceptionText.vue'
  export default {
    props:{
        // 异常名字
        exceptionName:{
            type:String,
            dafault:'这是异常的名字'
        },
        // 异常站点占比
        exceptionSiteRate:{
            type:String,
            default:'0%'
        },
        // 异常数占比
        exceptionNumRate:{
            type:String,
            default:'0%'
        }
    },
    components:{
        DustExceptionText
    },
    data() {
      return{

      }
    },
    mounted() {

    },
    methods: {
        getExceptionData(val1,val2){
            this.$emit('bExceptionData',val1,val2)
        }
     }
}
</script>

<template>
 <div class="card-content">
              <!-- 标头 -->
              <div>
                <image class="card-header-image"></image>
                <span class="card-header-text">{{ exceptionName }}</span>
              </div>

              <div>
                <span class="card-exceptionname-text1">异常站点占比:</span>
                <span>{{exceptionSiteRate}}</span>
                <span class="card-exceptionname-text2">异常数占比:{{exceptionNumRate }}</span>
              </div>
              <hr />
              <!-- 异常的店铺名字 -->
              <div>
                <el-scrollbar max-height="70px">
                  <span>名字组件</span>
                  <DustExceptionText @submit-exception-data="getExceptionData"></DustExceptionText>
                </el-scrollbar>
              </div>
              <!-- 结束 -->
            </div>
</template>

<style  scoped>
.card-content {
  min-height: 200px;
  border: 2px solid #9fdb1d;
  border-radius: 20px;
}
</style>