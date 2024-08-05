<!-- 日均值 -->
<script>
import InputSearch from '@/sfc/InputSearch.vue'
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import exceptionApi from '@/api/exceptionApi.js'
import DustRadarChart from '@/views/risk_assessment/components/DustRadarChart.vue'
import index from '@/utils/risk_estimate_common_function/index.js'
import ButtonClick from '@/sfc/ButtonClick.vue'
import dayjs from 'dayjs'
import MonthSelect from '@/sfc/MonthSelect.vue'
import riskApi from '@/api/risk/riskApi.js'
import riskValue from '@/utils/risk_estimate_common_function/riskValue.js'
import siteInfo from '@/api/site/siteInfo.js'
import CompDailyStatistic from '@/views/risk_assessment/riskModel/components/CompDailyStatistic.vue'
export default {
  props: {
    // 点位名字
    siteName: {
      type: String,
      default: ''
    },
    // 月份
    time: {
      type: String,
      default: ''
    },
    // 展示页面的全部
    showAll: {
      type: Boolean,
      default: true
    }
  },
  components: {
    InputSearch,
    AreaAndmonitorType,
    DustRadarChart,
    ButtonClick,
    MonthSelect,
    CompDailyStatistic
  },
  data() {
    return {
      isNoData: false,
      loading: false,
      screenLoading: false,
      parentDataFlag: false,
      chartData: [],
      chartData1: {}, //保存查询的结果
      chartData2: {},
      chartData3: {},
      chartData4: {},
      begin: '', //开始时间
      end: '', //结束时间

      form: {
        // 站点名称
        siteName: '',
        // 设备编号
        mnCode: '3234',
        // 开始时间
        beginTime: '',
        // 结束时间
        endTime: ''
      },
      month: '',

      // 折线图配置项
      option: {},
      // 数据清单
      bill: {
        min: '',
        max: '',
        avg: '',
        online: 100,
        valid: 100,
        exceeding: 0,

        //  典型异常复现率
        exceptionRecurrence: 0,
        // 异常类型据聚集度
        exceptionTypeAggregation: 0,

        exception: 0,
        mutationCount: 0,
        exceedingNearCount: 0,
        exceedingCriticalDegree: 0
      },

      // 查询按钮加载效果
      queryButton: false,

      // 风险值排名前十的站点
      top_10_sites_with_risk_values: [{ name: '', riskValue: 0.2 }],
      // 风险值
      weight: '',
      // 无数据配置时间段
      areaColor: [],
      // 某站点的基本信息
      siteInfo: {},

      // 异常风险的值
      exceptionRisk: {
        // 在线率风险
        onlineRisk: '',
        // 有效率风险
        validRisk: '',
        // 超标风险
        exceedRisk: '',
        // 异常类型聚集度
        exceptionTypeAggregation: '',
        // 典型异常复现率
        typicalExceptionRepetitionRate: ''
      }
    }
  },
  watch: {
    'form.siteName'() {
      if (this.siteName != '') {
        // 更新站点名字和时间
        this.form.siteName = this.siteName
        this.screenLoading = true
        siteInfo.queryMnCode(this.siteName).then((response) => {
          this.form.mnCode = response.data.data[0].mnCode
          this.month = this.time
          // 同时更新月起始时间
          this.form.beginTime = dayjs(this.month).startOf().format('YYYY-MM-DD HH:mm:ss')
          this.form.endTime = dayjs(this.month).endOf('month').format('YYYY-MM-DD HH:mm:ss')

          // 更新该站点的所属场景和运维商
          this.getSiteInfo(this.form.mnCode)
          // 更新统计数据
          this.getAnalysisData()
          // 计算风险值
          this.calRiskValue()
          this.screenLoading = false
        })
      }
    }
  },

  computed: {
    // 风险等级
    riskGradeAndAdvice() {
      return riskApi.getRiskAdvice(this.weight)
    }
  },
  mounted() {
    if (this.showAll) {
      // 加载风险值最高的站点数据
      this.ShowDefaultData()
    }
  },
  methods: {
    // 查询站点统计信息
    async querySiteStaticsInfo(row) {
      this.form.siteName = row.siteName
      // 更新统计数据
      await this.getAnalysisData()
      // 计算风险值
      this.calRiskValue()
    },

    // 格式化月份
    giveMonth(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.month = dayjs(val).format('YYYY-MM-DD')
      // 同时更新开始和结束时间
      this.form.beginTime = dayjs(this.month).startOf().format('YYYY-MM-DD HH:mm:ss')
      this.form.endTime = dayjs(this.month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 风险评估按钮
     * @param：
     * @returns：
     */
    riskAssessment() {
      // 更新排名清单
      this.getRiskRank()
      // 更新该站点的所属场景和运维商
      this.getSiteInfo(this.form.mnCode)
      // 更新分析数据
      this.getAnalysisData()
      // 计算风险值
      this.calRiskValue()
    },

    // 更新分析数据
    getAnalysisData() {
      // 日统计数据
      this.fetchDayAnalysisData()
      // 异常数据
      this.fetchExceptionAnalysisData()
    },

    findObjectByPropertyValue(array, property, value) {
      return array.find((obj) => obj[property] === value)
    },

    // 此页面打开时
    ShowDefaultData() {
      // 默认加载展示的内容
      this.updateOriginPage()
    },

    // 加载默认展示的内容
    async updateOriginPage() {
      this.screenLoading = true
      // 更新排名清单，并得到风险值最高站点
      let arr = await this.getRiskRank()
      this.form.siteName = arr[0]
      this.form.mnCode = arr[1]
      this.screenLoading = false

      // 更新该站点的所属场景和运维商
      this.getSiteInfo(this.form.mnCode)
      // 更新日统计数据
      this.getAnalysisData()
      // 计算风险值
      this.calRiskValue()
    },

    /**
     * 得到数据风险值 ，并计算风险值
     * @param：
     * @returns：
     */
    calRiskValue() {
      riskApi.queryRiskValue(this.form.mnCode, this.month, 'month').then((response) => {
        const rValue = response.data.data[0]
        if (!rValue) {
          this.weight = 0
          return
        }
        this.exceptionRisk.onlineRisk = rValue.onlineRisk
        this.exceptionRisk.validRisk = rValue.validRisk
        this.exceptionRisk.exceedRisk = rValue.exceedRisk
        this.exceptionRisk.exceptionTypeAggregation = rValue.exceptionTypeAggregation
        this.exceptionRisk.typicalExceptionRepetitionRate = rValue.typicalExceptionRepetitionRate
        this.weight = riskValue.calRiskValue(rValue).toFixed(2)
      })
    },

    //  根据目前站点，月份，查折线图日统计数据
    fetchDayAnalysisData() {
      this.loading = true
      this.queryButton = true
      exceptionApi
        .analysisdata(this.form.siteName, this.form.beginTime, this.form.endTime, 'day')
        .then((response) => {
          this.chartData = response
          this.loading = false
          this.queryButton = false
          if (response.length == 0) {
            this.isNoData = true
            return
          }
          // 分析数据中的最早时间
          let begin = this.chartData[0].lst
          // 分析数据中的最晚时间
          let end = this.chartData[this.chartData.length - 1].lst

          // 移除空数据状态
          this.isNoData = false

          //  折线图数据
          let temp = index.calBillData(this.chartData, begin, end)
          this.bill.min = temp['min']
          this.bill.max = temp['max']

          this.bill.avg = temp['avg']
          this.bill.online = temp['online']
          this.bill.valid = temp['valid']
          this.bill.exceeding = temp['exceeding']
        })
    },
    // 企业异常统计数据
    fetchExceptionAnalysisData() {
      exceptionApi
        .exceptiondata1({
          siteName: this.form.siteName,
          beginTime: this.form.beginTime,
          endTime: this.form.endTime
        })
        .then((res) => {
          let obj = index.calRecur(res.data.data)
          this.bill.exceptionRecurrence = obj['exceptionRecurrence']
          this.bill.exceptionTypeAggregation = obj['exceptionTypeAggregation']
          this.bill.exception = obj['exception']
          this.bill.mutationCount = obj['mutationCount']
          this.bill.exceedingNearCount = obj['exceedingNearCount']
          this.bill.exceedingCriticalDegree = obj['exceedingCriticalDegree']
        })
    },

    // 得到前10风险排名清单
    async getRiskRank() {
      let response = await riskApi.queryRiskValue('', this.month, 'month')
      if (!response.data.data.length) {
        return ['', '']
      }
      let tableData = riskValue.backComprehensiveRiskTableData(response.data.data)

      this.top_10_sites_with_risk_values = this.getTopRiskData(tableData, 10)
      if (this.top_10_sites_with_risk_values.length != 0) {
        // 表格按风险值倒叙排列
        this.$nextTick(() => {
          this.$refs.table.sort('riskValue', 'descending')
        })
        // 保存风险值最高的站点名称和设备编号
        let temp = []
        temp.push(
          this.top_10_sites_with_risk_values[0].siteName,
          this.top_10_sites_with_risk_values[0].mnCode
        )
        return temp
      }
    },
    /**
     * 降序排列，返回降序前num的元素
     * @param： 对象数组，返回的数量
     */
    getTopRiskData(arr, num) {
      // 按照riskValue降序排列
      arr.sort((a, b) => b.riskValue - a.riskValue)
      // 获取前num个元素
      return arr.slice(0, num)
    },
    /**
     * 根据设备编号查询站点基本信息
     * @param： 设备编号
     */
    getSiteInfo(mnCode) {
      if (mnCode == '') {
        this.siteInfo = {
          typename: '',
          dutyCompany: ''
        }
        return
      }
      siteInfo.querySiteInfoByMnCode(mnCode).then((response) => {
        if (response.data.data) {
          this.siteInfo = response.data.data[0]
        } else {
          this.siteInfo = {
            typename: '',
            dutyCompany: ''
          }
        }
      })
    },

    openDetail() {
      const encodedSiteName = encodeURIComponent(this.form.siteName)
      const timeType = '1'
      const jumpPage = '2'
      this.$router.push(`/exceptionDetail/${encodedSiteName}/${this.month}/${timeType}/${jumpPage}`)
    }
  }
}
</script>

<template>
  <el-form :inline="true" :model="form">
    <el-form-item class="form-item">
      <AreaAndmonitorType></AreaAndmonitorType>
    </el-form-item>

    <el-form-item class="form-item">
      <InputSearch
        :site-name="form.siteName"
        isNeedDefaultSite="0"
        @submit-value="(n) => (form.siteName = n)"
        @submit-mncode="(n) => (form.mnCode = n)"
      ></InputSearch>
    </el-form-item>

    <el-form-item v-show="showAll">
      <MonthSelect @submit-value="giveMonth"></MonthSelect>
    </el-form-item>

    <el-form-item v-show="showAll">
      <ButtonClick
        content="风险评估"
        type="primary"
        :loading="queryButton"
        @do-search="riskAssessment"
      ></ButtonClick>
    </el-form-item>
  </el-form>

  <div v-loading="screenLoading" class="wait-name">
    <div class="chart-container" v-show="!isNoData && !screenLoading">
      <el-card class="time-text">
        <h4>{{ form.siteName }}</h4>

        <br />
        <br />
        <span>数据统计时段：{{ form.beginTime }} ~ {{ form.endTime }}</span>
        <el-tag class="mx-1">场景</el-tag>{{ siteInfo.typename }}

        <el-tag class="mx-1">运维商</el-tag>{{ siteInfo.dutyCompany }}
        <el-button
          type="primary"
          size="default"
          class="exception-button"
          v-show="showAll"
          @click="openDetail"
        >
          数据异常详情
        </el-button>
      </el-card>

      <el-row :gutter="10">
        <el-col :span="5" v-show="showAll">
          <el-card shadow="never" class="table-class">
            <el-table
              ref="table"
              :highlight-current-row="true"
              :data="top_10_sites_with_risk_values"
              :default-sort="{ prop: 'riskValue', order: 'descending' }"
              height="540"
            >
              <el-table-column
                type="index"
                label="序号"
                fixed
                width="52"
                show-overflow-tooltip
                align="center"
              />
              <el-table-column
                prop="siteName"
                label="点位名称"
                show-overflow-tooltip
                width="99"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    text
                    class="table-button"
                    @click="querySiteStaticsInfo(row)"
                  >
                    <span class="risk-rank-site">
                      {{ row.siteName }}
                    </span>
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                prop="riskValue"
                label="风险值"
                sortable
                show-overflow-tooltip
                align="center"
              />
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="showAll ? 11 : 14">
          <el-card shadow="never" class="table-class">
            <DustRadarChart
              :name="[
                '数据有效风险',
                '异常复现风险',
                '异常类型聚集风险',
                '超标异常风险',
                '数据在线风险'
              ]"
              :yData="exceptionRisk"
            ></DustRadarChart>
          </el-card>
        </el-col>

        <el-col :span="showAll ? 4 : 5">
          <el-card shadow="never" class="card-height risk-card">
            <template #header>
              <span class="title-16"> 风险值(0~1)： </span>
              <span
                :class="{
                  'weightColor-low': weight < 0.15,
                  'weightColor-medium': weight >= 0.15 && weight <= 0.6,
                  'weightColor-heigh': weight > 0.6
                }"
              >
                {{ weight }}</span
              >
            </template>
            <div class="risk-text-container">
              <div class="risk-grade">
                <h1 class="sub-title">风险等级：</h1>
                <span
                  :class="{
                    'weightColor-low': weight < 0.15,
                    'weightColor-medium': weight >= 0.15 && weight <= 0.6,
                    'weightColor-heigh': weight > 0.6
                  }"
                  >{{ riskGradeAndAdvice.riskGrade }}
                </span>
              </div>

              <div class="risk-advice">
                <h1 class="sub-title">管控建议：</h1>
                <div
                  v-for="item in riskGradeAndAdvice.riskAdvice"
                  :key="item"
                  class="risk-advice-text"
                >
                  {{ item }}
                </div>
              </div>

              <div class="grade-instance">
                <div class="container">
                  <div class="block-color heigh"></div>
                  <div>高风险(>0.6)</div>
                </div>
                <div class="container">
                  <div class="block-color medium"></div>
                  <div>中风险(0.15~0.6)</div>
                </div>
                <div class="container">
                  <div class="block-color low"></div>
                  <div>低风险(＜0.15)</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="showAll ? 4 : 5">
          <el-card shadow="never" class="card-height">
            <template #header>
              <span class="title-16">风险详情</span>
            </template>

            <el-form>
              <el-form-item label="最大值："> {{ bill.max }} mg/m³ </el-form-item>
              <el-form-item label="最小值："> {{ bill.min }} mg/m³ </el-form-item>
              <el-form-item label="数据有效率："> {{ bill.online * 100 }}% </el-form-item>
              <el-form-item label="数据在线率："> {{ bill.valid * 100 }}% </el-form-item>
              <el-form-item label="数据超标率："> {{ bill.exceeding * 100 }}% </el-form-item>
              <el-form-item label="异常类型聚集度：">
                {{ (exceptionRisk.exceptionTypeAggregation * 100).toFixed(2) }}%
              </el-form-item>

              <el-tag size="small" v-show="bill.exception"
                >共出现了{{ bill.exception }}类异常</el-tag
              >

              <el-form-item label="典型异常复现率：">
                {{ (exceptionRisk.typicalExceptionRepetitionRate * 100).toFixed(2) }}%
              </el-form-item>

              <div>
                <el-tag size="small" v-show="bill.mutationCount"
                  >量级突变异常:{{ bill.mutationCount }}条</el-tag
                >
              </div>

              <div>
                <el-tag size="small" v-show="bill.exceedingNearCount"
                  >临近超标异常:{{ bill.exceedingNearCount }}条</el-tag
                >
              </div>

              <div>
                <el-tag size="small" v-show="bill.exceedingCriticalDegree"
                  >单日超标次数临界异常:{{ bill.exceedingCriticalDegree }}条</el-tag
                >
              </div>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <CompDailyStatistic :fetch-params="form" />
    </div>
  </div>
  <el-empty description="暂无数据" v-show="isNoData" :image-size="200" />
</template>

<style scoped>
.el-form {
  margin: 10px;
}
.form-item {
  margin-top: 10px;
}
.chart-container {
  margin-left: 10px;
}
.time-text {
  font-size: 14px;
  color: #333333;
  letter-spacing: 1px;
}
.el-card {
  margin-top: 15px;
  border-radius: 9px;
}
.chart-container {
  width: 98%;
  /* height: 600px; */
}

.card-height {
  height: 570px;
}
.el-header {
  background-color: #010408;
  color: #333;
  line-height: 60px;
}
.risk-advice {
  /* margin: 20px 0px; */
}
.container {
  display: flex;
  margin-bottom: 10px;
}
.grade-instance {
  /* margin-top: 50px; */
}
.block-color {
  width: 1em;
  height: 1em;
  margin-right: 10px;
  margin-top: 3px;
}
.heigh {
  background-color: red;
}
.medium {
  background-color: #dabe09;
}
.low {
  background-color: #9fdb1d;
}

.el-text {
  align-self: left;
}
.el-form-item {
  margin-bottom: 20px;
}
:deep().el-form-item__content {
  justify-content: flex-end;
}
.title-16 {
  font-size: 16px;
  font-weight: bold;
}
.weightColor-low {
  color: #9fdb1d;
  font-size: 16px;
}
.weightColor-medium {
  color: #dabe09;
  font-size: 16px;
}
.weightColor-heigh {
  color: red;
  font-size: 16px;
}
.risk-grade {
  display: flex;
}
:deep().el-table__header-wrapper {
  color: red;
}
/* .wait-name {
        width: 500px;
        height: 600px;
      } */
.table-class {
  /* border: 1px solid blue; */
  /* margin: 20px 0px 20px 0px; */
  height: 570px;
}

.table-button {
  letter-spacing: 1px;
  text-decoration: underline;
  /* border-radius: 0px; */
}
.risk-rank-site {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 80px;
}
.site-name {
  margin-left: 20px;
}
.risk-advice-text {
  font-size: 14px;
  color: #333333;
  letter-spacing: 1.5px;
  margin-top: 10px;
}
.sub-title {
  font-size: 14px;
  color: #333333;
}

.risk-text-container {
  height: 490px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.el-tag {
  margin-left: 25px;
  font-size: 14px;
  vertical-align: baseline;
}
.exception-button {
  vertical-align: baseline;
  margin-left: 150px;
}

.site-info-detail {
  display: flex;
  justify-content: space-between;
}
.mx-1 {
  margin-left: 100px;
}
</style>
