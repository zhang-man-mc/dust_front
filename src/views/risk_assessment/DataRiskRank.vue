<script>
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import { useCommonFunction } from '../../utils/common.js'
import dayjs from 'dayjs'
import ButtonExportExcel from '@/sfc/ButtonExportExcel.vue'
import ButtonClick from '@/sfc/ButtonClick.vue'
import { ElMessage } from 'element-plus'
import MonthSelect from '@/sfc/MonthSelect.vue'
import riskApi from '@/api/risk/riskApi.js'
import riskValue from '@/utils/risk_estimate_common_function/riskValue.js'
export default {
  components: {
    AreaAndmonitorType,
    ButtonExportExcel,
    ButtonClick,
    MonthSelect
  },
  data() {
    return {
      //   表格数据
      tableData: [],
      isNoData: true,
      loading: false,
      // 统计分析按钮加载中
      queryButton: false,
      // 导出按钮加载中
      exportButton: false,
      form: {
        // 站点名称
        name: '',
        // 开始时间
        beginTime: '',
        // // 结束时间
        endTime: '',

        // 选择的月份
        month: ''
      },
      bill: {
        min: '',
        max: '',
        avg: '',
        online: '',
        valid: '',
        exceeding: '',

        //  典型异常复现率
        exceptionRecurrence: '',
        // 异常类型据聚集度
        exceptionTypeAggregation: ''
      },

      // 表格数据
      table: [],
      // 表格高度
      tableHeight: 600,
      currentRow: []
    }
  },
  setup() {
    // 引入 百分号比较大小 导出功能
    const { exportToExcel } = useCommonFunction()
    return { exportToExcel }
  },
  computed: {
    // 计算高中低站点数量
    riskGradeNum() {
      let riskGrade = {}
      if (this.table) {
        let highRisk = 0
        let middleRisk = 0
        let lowRisk = 0
        this.table.forEach((item) => {
          switch (item.riskGrade) {
            case '高风险':
              highRisk++
              break
            case '中风险':
              middleRisk++
              break
            case '低风险':
              lowRisk++
              break
          }
        })
        riskGrade.high = highRisk
        riskGrade.middle = middleRisk
        riskGrade.low = lowRisk
      }
      return riskGrade
    },
    // 高中低风险比例
    riskGradeRate() {
      let rate = {
        high:0,
        middle:0,
        low:0
      }
      if (this.table.length !=0 ) {
        let num = this.table.length
        let highGrade = ((this.riskGradeNum.high / num)*100).toFixed(2)
        let middleGrade = ((this.riskGradeNum.middle / num)*100).toFixed(2)
        let lowGrade = ((this.riskGradeNum.low / num)*100).toFixed(2)
        rate.high = highGrade
        rate.middle = middleGrade
        rate.low = lowGrade
      }
      return rate
    }
  },
  mounted() {
    //
    this.fetch()
    this.calTableHeight()
  },
  methods: {
    /**
     * 将中国标准时间转为指定格式
     * @param：
     * @returns：
     */
    giveMonth(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.form.month = dayjs(val).format('YYYY-MM-DD')
      // 同时更新开始和结束时间
      this.form.beginTime = dayjs(this.form.month).startOf().format('YYYY-MM-DD HH:mm:ss')
      this.form.endTime = dayjs(this.form.month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      console.log(this.form.beginTime, this.form.endTime)
    },

    // 功能：改变表格某个单元格的颜色
    tableCellClassName({ row, columnIndex }) {
      // 平均值不满足标准时
      if (columnIndex == 4) {
        if (row.riskValue >= 0.8) {
          return 'warning-row'
        }
      }
    },
    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px  - 40px - 40px - var(--el-main-padding) * 2`
    },

    // 点击风险排名按钮
    fetchData() {
      this.loading = true
      this.queryButton = true
      riskApi.queryRiskValue('', this.form.month, 'month').then((response) => {
        this.loading = false
        this.queryButton = false
        if (response.data.data.length == 0) {
          this.isNoData = true
          return
        }
        
        this.table = riskValue.backComprehensiveRiskTableData(response.data.data)
        this.queryButton = false
        this.isNoData = false
        this.loading = false
        this.$nextTick(() => {
          this.$refs.table.sort('riskValue', 'descending')
        })
      })
    },

    /**
     * 初始加载函数
     */
    fetch() {
      // 分析数据
      this.fetchData()
      // 异常数据
      // this.exceptiondataCount()
    },

    // 单元格内容换行
    wrapIndex(index) {
      return index.replace(/\n/g, '<br/>')
    },

    /**
     * 导出为Excel

     */
    exportData() {
      if (this.table.length != 0) {
        const tableColumns = [
          'siteName',
          'region',
          'monitorType',
          'riskValue',
          'riskGrage',
          'riskAdvice',
          'beginTime',
          'endTime'
        ]
        const excelColumns = [
          ['A1', '站点名称'],
          ['B1', '区域'],
          ['C1', '监测类型'],
          ['D1', '风险值'],
          ['E1', '风险等级'],
          ['F1', '管控措施'],
          ['G1', '开始日期'],
          ['H1', '结束日期']
        ]
        this.exportButton = true
        this.exportToExcel(this.table, tableColumns, excelColumns, '综合风险排名.xlsx')
        this.exportButton = false
      } else {
        ElMessage('无数据需要导出')
      }
    },
    openDetail(row) {
      const encodedSiteName = encodeURIComponent(row.siteName)
      const jumpPage = 1 
      this.$router.push(`/exceptionDetail/${encodedSiteName}/${this.form.month}/1/${jumpPage}`)
    }
  }
}
</script>

<template>
  <el-row ref="h1">
    <el-col :span="24">
      <el-form :inline="true" :model="form">
        <el-form-item>
          <AreaAndmonitorType></AreaAndmonitorType>
        </el-form-item>

        <el-form-item>
          <MonthSelect @submit-value="giveMonth"></MonthSelect>
        </el-form-item>

        <el-form-item>
          <ButtonClick
            style="margin-right: 12px"
            content="风险排名"
            type="primary"
            :loading="queryButton"
            @do-search="fetch"
          ></ButtonClick>
          <ButtonExportExcel
            content="导出数据"
            type="success"
            :loading="exportButton"
            @do-export="exportData"
          ></ButtonExportExcel>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24" class="tag">

      <el-tag type="primary"> 参评站点数</el-tag><span class="analysis-info">{{ table.length }}</span>
      <el-tag type="danger"> 高风险数</el-tag>  <span class="analysis-info">{{ riskGradeNum.high }} ({{ riskGradeRate.high }}%)</span>
      <el-tag type="warning"> 中风险数</el-tag>  <span class="analysis-info">{{ riskGradeNum.middle }} ({{ riskGradeRate.middle }}%)</span> 
      <el-tag type="success"> 低风险数</el-tag> <span class="analysis-info">{{ riskGradeNum.low }} ({{ riskGradeRate.low }}%)</span> 


    </el-col>
  </el-row>



  <el-table
    ref="table"
    :data="table"
    :height="tableHeight"
    v-loading="loading"
    element-loading-text="后台分析中..."
    style="width: 98%"
    :cell-class-name="tableCellClassName"
    :default-sort="{ prop: 'riskValue', order: 'descending' }"
    v-show="!isNoData"
    border
  >
    <el-table-column
      type="index"
      prop="name"
      label="序号"
      fixed
      align="center"
      width="55"
      show-overflow-tooltip
    />
    <el-table-column prop="siteName" label="点位名称" align="center" show-overflow-tooltip>
      <template #default="{ row }">
        <el-button type="primary" text class="table-button" @click="openDetail(row)">{{
          row.siteName
        }}</el-button>
      </template>
    </el-table-column>

    <el-table-column prop="region" label="区县" align="center" width="80" show-overflow-tooltip />
    <el-table-column
      prop="monitorType"
      label="检测类型"
      align="center"
      width="80"
      show-overflow-tooltip
    />
    <el-table-column
      prop="riskValue"
      label="风险值"
      sortable
      align="center"
      width="100"
      show-overflow-tooltip
    />
    <el-table-column
      prop="riskGrade"
      label="风险等级"
      align="center"
      width="100"
      show-overflow-tooltip
    />
    <el-table-column prop="riskAdvice" label="管控措施" show-overflow-tooltip>
      <template #default="scope">
        <div v-html="wrapIndex(scope.row.riskAdvice)"></div>
      </template>
    </el-table-column>
    <el-table-column
      prop="beginTime"
      label="日期"
      sortable
      align="center"
      width="160"
      show-overflow-tooltip
    />
    <!-- <el-table-column
      prop="endTime"
      label="结束日期"
      sortable
      align="center"
      width="160"
      show-overflow-tooltip
    /> -->
  </el-table>
  <el-empty v-show="isNoData" :image-size="200" />
</template>

<style scoped>
.el-row,
.el-table {
  margin: 10px 0px 0px 10px;
}

:deep(.el-table__row .warning-row) {
  background-color: red;
  /* color: rgb(241, 236, 236); */
}
.table-button {
  letter-spacing: 1px;
  text-decoration: underline;
  border-radius: 0px;
}
.el-table {
  color: #333333;
}
.analysis-info {
  margin-right: 20px;
}
.tag{
  margin: 10px 5px 5px 1px;
}
.el-tag {
  font-size: 14px;
  vertical-align: baseline;
}
</style>
