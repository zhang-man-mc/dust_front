<script>
import getHistoryApi from '@/api/py/getHistoryApi.js'
import { ElMessage } from 'element-plus'
import exceptionApi from '@/api/exceptionApi.js'
export default {
  data() {
    return {
      async: '未完成....',
      normal: '未变化....',
      count:0
    }
  },
  mounted() {
    // this.query()
    // this.getAnalysisData()
  },
  methods: {
    getData() {
      getHistoryApi.fetchDustHistoryData().then((res) => {
        print(res)
      })
      setTimeout(() => {
        ElMessage.success('数据获取中')
      }, 600)
    },
    getAnalysisData() {
      const analysis = exceptionApi.analysisdata(
        this.form.name,
        this.form.beginTime,
        this.form.endTime,
        'day'
      )
      const exception = exceptionApi.exceptiondata1({
        siteName: this.form.name,
        beginTime: this.form.beginTime,
        endTime: this.form.endTime
      })
      this.loading = true
      this.queryButton = true
      Promise.all([analysis, exception]).then((res) => {
        this.chartData = res[0].data.data
        let exceptionData = res[1].data.data
        // console.log('分析数据：',analysisData);
        // console.log('异常数据：',exceptionData);
        // 得到有效数据的起始时间
        this.begin = this.chartData[0].lst
        this.end = this.chartData[this.chartData.length - 1].lst
        // 移除空数据状态
        this.isNoData = false
        // 生成折线图数据配置
        this.setChart()

        //  日统计数据
        let temp = index.calBillData(this.chartData, this.begin, this.end)
        // 异常数据
        let obj = index.calRecur(exceptionData)

        this.bill.min = temp['min']
        this.bill.max = temp['max']
        this.bill.avg = temp['avg']
        this.bill.online = temp['online']
        this.bill.valid = temp['valid']
        this.bill.exceeding = temp['exceeding']

        this.bill.exceptionRecurrence = obj['exceptionRecurrence']
        this.bill.exceptionTypeAggregation = obj['exceptionTypeAggregation']
      })
    },


 increment(){
    this.count++
    console.log(document.getElementById('but').textContent)
    nextTick(()=>{
      console.log('abc',document.getElementById('but').textContent)
    })
    
  }
  }
}
</script>

<template>
  <el-button id="but" @click="increment" >{{count}} </el-button>
  <div>
    <!-- 点击"获取数据"后,每隔一个小时执行一次 -->
  </div>

  <el-descriptions title="数据获取详情" direction="vertical" :column="4" :size="size" border>
    <el-descriptions-item label="数据来源">扬尘</el-descriptions-item>
    <el-descriptions-item label="数据获取频率">1小时</el-descriptions-item>
    <el-descriptions-item label="自动异常分析" :span="2"
      ><el-tag size="small">是</el-tag></el-descriptions-item
    >
    <el-descriptions-item label="站点基本信息数据">
      <el-tag size="small">是</el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="浓度数据"><el-tag size="small">是</el-tag> </el-descriptions-item>
  </el-descriptions>

  <el-button type="primary" @click="getData"> 自动获取 </el-button>
  <div>异步函数：{{ async }}</div>
  <div style="margin-bottom: 20px"></div>
  <div>后面： {{ normal }}</div>
</template>

<style scoped>
.el-descriptions,
.el-button {
  margin: 20px;
}
</style>
