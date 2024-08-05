<!-- 点击 ”查看详细” 的对话框 -->
<!-- 上一条下一条由子组件传递给父组件，父组件监听信号 -->
<script>
import exceptionOption from '@/utils/chartFunction/exceptionOption.js'
import index from '@/utils/exception_common_function/index.js'
import DustLineChart from '@/views/exception/components/DustLineChart.vue'
import historyApi from '@/api/historyApi.js'
import lineChartFunc from '@/utils/chartFunction/lineChart.js'
import time from '@/utils/time.js'
export default {
  props: {
    // 表格的一行数据
    row: {
      type: Object,
      default() {
        return {}
      }
    },
    // 对话框是否显示
    dialogTableVisible: {
      type: Boolean,
      default: false
    },
    buttonDisabled: {
      type: Object,
      default() {
        return { pre: false, next: false }
      }
    }
  },
  components: {
    DustLineChart
  },
  emits: ['update:dialogTableVisible', 'getPreRowData', 'getNextRowData'],
  computed: {
    visible: {
      get() {
        return this.dialogTableVisible
      },
      set(value) {
        this.$emit('update:dialogTableVisible', value)
      }
    }
  },
  watch: {
    row: {
      handler() {
        this.display()
      },
      deep: true
    }
  },
  data() {
    return {
      // 异常表格的数据
      historyData: [],
      //  折线图配置项
      lineChartOption: {},

      // 按钮，图形加载中
      loading: {
        // 上一条按钮
        preButton: false,
        // 下一条按钮
        nextButton: false,
        // 折线图
        lineChart: false
      },

      // 标记位
      flag: {
        // 数据加载时 上下条按钮不能再点击
        banTouch: 0,
        pre: false,
        next: false
      },

      isPreCanTouch: false,
      isNextCanTouch: false
    }
  },

  methods: {
    async display() {
      // 表格数据
      await this.getExceptionTableDataByCurrentRow(this.row)

      // 折线图数据
      this.setLineChart(this.row)
    },

    /**
     * 得到异常表格的数据
     * @param： 点位名称，异常开始时间，异常结束时间
     * @returns：
     */
    async getExceptionTableDataByCurrentRow({ name, exceptionType, beginTime, endTime }) {
      if (!name || !beginTime || !endTime) {
        return
      }
      console.log('异常为', exceptionType)
      // 数据缺失异常时，构造表格数据
      if (exceptionType == '0') {
        this.setOfflineTableData(this.row)
        return
      }
      // 有效率异常时 设置折线图加载中效果
      if (exceptionType == '8') {
        this.loading.lineChart = true
      }

      this.loading.preButton = true
      this.loading.nextButton = true

      // 根据异常的点位名称、开始、结束时间，查询该时段的颗粒物浓度数据
      const response = await historyApi.queryHistoryData({
        siteName: name,
        beginTime: beginTime,
        endTime: endTime
      })
      //  异常表格得到数据
      this.historyData = response.data.data

      this.flag.pre = false
      this.flag.next = false

      this.loading.preButton = false
      this.loading.nextButton = false
    },

    /* ***********************************************************************************  折线图 */
    /**
     * 设置折线图
     * @param：
     * @returns：
     */
    async setLineChart({ exception, exceptionType, beginTime, endTime }) {
      if (exceptionType == '8') {
        this.validProcess(this.historyData, { exception, exceptionType, beginTime, endTime })
        this.loading.lineChart = false
        return
      }
      // 计算异常区间的前后45分钟
      const beforeAndAfterTime = index.before45AndAfter45(beginTime, endTime)
      // 请求整段时间段的颗粒物浓度数据

      // 对请求回的数据进行划分
      const chartParams = await this.organizeLineChartsOptionParams(beforeAndAfterTime, this.row)
      this.lineChartOption = exceptionOption.setExceptionChartOption(chartParams)
    },

    /**
     * 构建折线图的配置项的参数
     * @param： 异常区间前后数据时间点， 表格当前行数据
     * @returns：
     */
    async organizeLineChartsOptionParams(
      time_point,
      { name, beginTime, endTime, exception, exceptionType }
    ) {
      // 折线图加载中效果
      this.loading.lineChart = true

      // 请求整段颗粒物浓度的数据
      const response = await historyApi.queryHistoryData({
        siteName: name,
        beginTime: time_point[0],
        endTime: time_point[3]
      })

      // 异常区间数据加上前后45分钟数据
      const allTimeData = response.data.data

      // x轴日期时间
      let xData = []
      // y轴 超标油烟浓度
      let yData = []
      let timeAndValue = {}

      // 从添加了首位区间的开始和结束时间进行遍历 保证时间以15分钟为间隔
      timeAndValue = index.keepContinuousByEachFiftyMinutes(
        time_point[0],
        time_point[3],
        allTimeData
      )
      xData = timeAndValue['xAxis']
      yData = timeAndValue['yAxis']

      // 提取异常起始时间点在整个区间内的数据索引
      let beginIndex = xData.findIndex((item) => item === beginTime)
      let endIndex = xData.findIndex((item) => item === endTime)

      this.flag.banTouch = 0
      this.loading.lineChart = false

      // 返回折线图的配置项的参数
      return {
        xData,
        yData,
        exceptionBeginTime: beginTime,
        exceptionEndTime: endTime,
        beginIndex,
        endIndex,
        exceptionName: exception,
        areaObj: '',
        lineColor: '',
        exceptionType
      }
    },

    /**
     * description：数据缺失异常时，设置的表格数据
     */
    setOfflineTableData({ name, mnCode, dutyCompany, beginTime, endTime }) {
      // 无数据时的时间数组 时间相差15分钟
      const abnormalTimeTenMinute = index.descFiftyTime(beginTime, endTime)

      //  对表格数据进行重构
      this.historyData = []
      for (let i = 0; i < abnormalTimeTenMinute.length; i++) {
        this.historyData.push({
          name: name,
          mnCode: mnCode,
          dutyCompany: dutyCompany,
          lst: abnormalTimeTenMinute[i],
          yData: ''
        })
      }
    },
    /**
     * 有效率异常 设置折线图配置项
     * @param：
     * @returns：
     */
    validProcess(historyData, { exception, exceptionType, beginTime, endTime }) {
      // x轴数据
      let xData = time.ascTime(beginTime, endTime, 15)
      // y轴数据
      let yData = []
      xData.forEach((item) => {
        // 查找该时间的数据
        let r = lineChartFunc.findDate(historyData, item)
        if (r) {
          yData.push(r.dustValue)
        } else {
          yData.push(null)
        }
      })
      // 得到有效数据的时间点
      let DataTime = time.validTime(historyData)
      let rangeTime = time.getMissingDays(xData[0], xData[xData.length - 1], DataTime, 15)
      console.log('无数据时间', rangeTime)
      // 得到背景区间的配置
      let areaObj = lineChartFunc.getMarkArea(rangeTime, '异常')
      let lineColor = []
      // 传入参数
      this.lineChartOption = exceptionOption.setExceptionChartOption({
        xData,
        yData,
        exceptionBeginTime: beginTime,
        exceptionEndTime: endTime,
        beginIndex: '',
        endIndex: '',
        exceptionName: exception,
        areaObj,
        lineColor,
        exceptionType
      })
    },

    /**
     * 点击“上一条”
     * @param：
     * @returns：
     */
    clickPre() {
      this.flag.pre = true
      this.$emit('getPreRowData')
    },
    /**
     * 点击“下一条”
     * @param：
     * @returns：
     */
    clickNext() {
      this.flag.next = true
      this.$emit('getNextRowData')
    }
  }
}
</script>

<template>
  <el-dialog
    class="exception-dialog"
    v-model="visible"
    draggable
    align-center
    height="700px"
    width="700px"
  >
    <!-- 头 -->
    <template #header>
      <div class="diag-head">
        <div class="diag-head-text">
          <div><span class="diag-head-text1">站点名称：</span>{{ row.name }}</div>
          <div><span class="diag-head-text1">设备编号：</span>{{ row.mnCode }}</div>
          <div><span class="diag-head-text1">运维商：</span>{{ row.dutyCompany }}</div>
          <div>
            <span class="diag-head-text1">异常时间段：</span>{{ row.beginTime }} ~
            {{ row.endTime }}
          </div>
        </div>
      </div>

      <div class="chart-jump-button">
        <el-button
          type="danger"
          :loading="flag.pre && loading.preButton"
          :disabled="buttonDisabled.pre"
          @click="clickPre"
          >上条异常</el-button
        >

        <el-button
          type="danger"
          :loading="flag.next && loading.nextButton"
          :disabled="buttonDisabled.next"
          @click="clickNext"
          >下条异常</el-button
        >
      </div>
    </template>

    <!-- 图形 -->
    <DustLineChart :option="lineChartOption" v-loading="loading.lineChart"></DustLineChart>

    <!-- 表格 -->
    <div>
      <el-table :data="historyData" size="default" height="200" border>
        <el-table-column
          type="index"
          label="序号"
          width="60px"
          align="center"
          fixed
        ></el-table-column>

        <el-table-column prop="lst" label="采集时间" align="center" show-overflow-tooltip />
        <el-table-column prop="yData" label="TSP(mg/m³)" align="center" show-overflow-tooltip />
        <el-table-column prop="flag" label="数据标识" align="center" show-overflow-tooltip />
      </el-table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-tag type="success" class="mx-1" effect="dark" round
          ><span v-show="row.exceptionType == '0'">缺失数据： </span>
          <span
            v-show="
              row.exceptionType == '1' ||
              row.exceptionType == '2' ||
              row.exceptionType == '3' ||
              row.exceptionType == '4' ||
              row.exceptionType == '5' ||
              row.exceptionType == '6' ||
              row.exceptionType == '7' ||
              row.exceptionType == '8'
            "
            >异常数据：</span
          >
          <span class="table-line-num">{{ historyData?.length }}条</span>
          <span v-show="row.exceptionType == '0'"> (逻辑计算)</span>
        </el-tag>
        <el-text v-show="row.exceptionType == '8'" type="warning" class="dialog-footer-text"
          >数据标识A为数据长期缺失,系统自动补全</el-text
        >
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 查看详情对话框模块的样式 */
.diag-head {
  /* 对话框头部区域 */
  min-height: 200px;
}
.diag-head-text1 {
  /* 对话框头部的属性字段加粗 */
  font-weight: bold;
}

.diag-head-text > div {
  /*  对话框异常时间段 */
  margin-top: 15px;
}
.diag-head-text {
  margin: 10px;
  padding: 10px;
  background: linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%);
  border: 2px solid #7bc0fc;
}
.chart-jump-button {
  display: flex;
  justify-content: right;
}

.mx-1 {
  justify-content: flex-start;
}
.dialog-footer {
  display: flex;
}
.dialog-footer-text {
  justify-content: flex-end;
  margin-left: auto;
  font-size: 14px;
  /* color: #333333; */
}
/* 查看详情对话框模块结束 */
</style>
