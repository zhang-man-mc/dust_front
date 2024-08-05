<script>
import exceptionApi from '@/api/exceptionApi.js'
import lineChart from '@/utils/chartFunction/lineChart.js'
import time from '@/utils/time.js'
// import time from '@/utils/time.js'
import FYLineChart from '@/components/chart/FYLineChart.vue'
export default {
  props: {
    fetchParams: {
      type: Object,
      default: {
        siteName: null,
        mnCode: null,
        beginTime: null,
        endTime: null
      }
    }
  },
  components: {
    FYLineChart
  },
  data() {
    return {
      chart: {
        // 日均值 折线图结果
        chartDataAvg: {},
        // 日有效率 折线图结果
        chartDataValid: {},
        // 无数据配置时间段
        areaColor: []
      }
    }
  },
  watch: {
    fetchParams: {
      handler() {
        if(this.fetchParams.siteName != '' && this.fetchParams.siteName != null){
          this.fetchDayAnalysisData()
        }
      },
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    //  根据目前站点，月份，查折线图日统计数据
    fetchDayAnalysisData() {
      exceptionApi.analysisdata(
          this.fetchParams.siteName,
          this.fetchParams.beginTime,
          this.fetchParams.endTime,
          'day'
        )
        .then(response => {
          const chartData = response
          if (chartData.length == 0) {
            return
          }

          const timeArr = chartData.map(item => {
            return item.lst
          })
          
          // 无数据的时间段
          let noDataTimeInterval = time.getMissingDays(this.fetchParams.beginTime, this.fetchParams.endTime,timeArr)
          // 无数据配置时间段
          this.chart.areaColor = lineChart.getMarkArea(noDataTimeInterval)
          this.setChart(chartData, this.fetchParams.beginTime, this.fetchParams.endTime)
   
        })
    },

    /**
     * 组件折线图的配置项
     * @param： 
     * @returns：
     */
    setChart(cData, bt, et) {
      if (cData.length!=0) {
        // 构建折线图x,y数据
        let obj = lineChart.getLineChartXYData(cData, bt, et)
        this.chart.chartDataAvg = {
          x: obj.xData,
          y: obj.yAvg
        }
        this.chart.chartDataValid = {
          x: obj.xData,
          y: obj.yValid
        }
      }
    },
  }
}
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card shadow="never">
        <FYLineChart
          title="日均值"
          :chartData="chart.chartDataAvg"
          yName="mg/m³"
          seriesName="日均值"
          :areaColor="chart.areaColor"
        />
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card shadow="never">
        <FYLineChart
          title="日有效率"
          :chartData="chart.chartDataValid"
          yName="%"
          seriesName="日有效率"
          :areaColor="chart.areaColor"
        />
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped></style>
