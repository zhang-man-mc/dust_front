<!--点击站点 跳转至风险模型页面  -->
<script>
import CompFlightInspection from '@/views/exception/components/CompFlightInspection.vue'
import CompDataRiskModel from '@/views/risk_assessment/components/CompDataRiskModel.vue'

export default {
  components: {
    CompFlightInspection,
    CompDataRiskModel
  },
  data() {
    return {
      siteName: '',
      time: '',
      // 时间类型
      timeType: '',
      //  1代表风险模型 2代表飞行巡检
      jumpPage: -1
    }
  },
  watch: {},
  mounted() {},
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // 通过 `vm` 访问组件实例
      vm.siteName = to.params.siteName
      vm.time = to.params.time
      vm.timeType = to.params.timeType
      vm.jumpPage = to.params.jumpPage

      vm.$nextTick(() => {})
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
      <span v-if="jumpPage == '1'"> 风险模型 </span>
      <span v-else-if="jumpPage == '2'"> 异常详情 </span>
    </template>
  </el-page-header>

  <div v-show="jumpPage == '1'">
    <CompDataRiskModel :site-name="siteName" :time="time" :show-all="false"></CompDataRiskModel>
  </div>

  <div v-show="jumpPage == '2'">
    <CompFlightInspection
      :site-name="siteName"
      :time="time"
      :time-type="timeType"
      :show-all="false"
    >
    </CompFlightInspection>
  </div>
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
