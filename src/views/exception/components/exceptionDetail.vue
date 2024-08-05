<!--点击审核 跳转至审核辅助页面  -->
<script>
import SubSiteAudit from '@/views/exception/components/SubSiteAudit.vue'
export default {
  components: {
    SubSiteAudit
  },
  data() {
    return {
      beginTime: '',
      endTime: '',
      // 异常类型
      exceptionType: '',
      
    }
  },
  watch: {},
  mounted() {
    console.log('midd',this.beginTime, this.endTime);
  },

  
  beforeRouteEnter(to,  from,  next)  {
   next((vm)  =>  {
     vm.beginTime  =  to.params.beginTime
     vm.endTime  =  to.params.endTime
     vm.exceptionType  =  to.params.exceptionType
     //  确保以便在组件实例更新后获取正确的值
     vm.$nextTick(()  =>  {
      //  console.log('midd11',  vm.beginTime,  vm.endTime);
     })
   })
},
  methods: {
    // 回退页面
    onBack() {
      this.$router.back()
    }
  }
}
</script>

<template>
  <el-page-header @back="onBack">
    <template #content>
      <span> 异常审核 </span>
    </template>
  </el-page-header>

  <SubSiteAudit :begin-time="beginTime"  :end-time="endTime" :exception-type="exceptionType" > </SubSiteAudit>
</template>

<style scoped>
.el-page-header {
  margin: 10px 0px 10px 10px;
}
span {
  font-size: 14px;
  color: #333333;
}
</style>
