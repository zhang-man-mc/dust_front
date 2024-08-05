<script>
import TimeShortCuts from '@/sfc/TimeShortCuts.vue'
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import { useCommonFunction } from '../../utils/common.js'
import requetsApi from '@/api/exportExcel/requetsApi.js'
import statisticApi from '@/api/statistic/statisticApi.js'
import dayjs from 'dayjs'
import ButtonExportExcel from '@/sfc/ButtonExportExcel.vue'
import ButtonClick from '@/sfc/ButtonClick.vue'

export default {
  components: {
    TimeShortCuts,
    AreaAndmonitorType,
    ButtonExportExcel,
    ButtonClick
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      total: 0,
      //   表格数据
      tableData: [],
      isNoData: true,
      loading: false,
      // 统计分析按钮加载中
      queryButton: false,
      // 导出按钮加载中
      exportButton: false,
      form: {
        // 开始时间
        beginTime: '',
        // 结束时间
        endTime: ''
      },
      tableHeight: '600',

      orderProp: 'dayAvg',
      order: 'descending'
    }
  },
  setup() {
    // 引入 百分号比较大小 导出功能
    const { cmpp, exportToExcel, percentFormatter } = useCommonFunction()
    return { cmpp, exportToExcel, percentFormatter }
  },

  mounted() {
    this.fetchData()
    this.calTableHeight()
  },
  methods: {
    // 功能：导出为Excel
    exportData() {
      let params = {
        beginTime: this.form.beginTime,
        endTime: this.form.endTime
      }
      this.exportButton = true
      requetsApi.fetchAllData(params).then((res) => {
        const data = res.data.data

        const tableColumns = [
          'name',
          'mnCode',
          'lst',
          'dayAvg',
          'min',
          'max',
          'dayOnline',
          'dayValid',
          'dayExceeding'
        ]
        const excelColumns = [
          ['A1', '站点名称'],
          ['B1', '设备编号'],
          ['C1', '监测日期'],
          ['D1', '平均值'],
          ['E1', '最小值'],
          ['F1', '最大值'],
          ['G1', '在线率'],
          ['H1', '有效率'],
          ['I1', '超标率']
        ]
        this.exportToExcel(data, tableColumns, excelColumns, '分析表.xlsx')
        this.exportButton = false
      })
    },

    // 功能：改变表格某个单元格的颜色
    tableCellClassName({ row, columnIndex }) {
      // 平均值不满足标准时
      if (columnIndex == 4) {
        if (row.dayAvg >= 0.8) {
          return 'warning-row'
        }
      }

      if (columnIndex == 7) {
        if (row.dayOnline < 0.9) {
          return 'red-color'
        }
      }

      if (columnIndex == 8) {
        if (row.dayValid < 0.9) {
          return 'red-color'
        }
      }
    },

    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      const h2 = this.$refs.h2.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px - ${h2}px - 40px - 120px - var(--el-main-padding) * 2`
    },
    // 页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val

      // 改变每页显示数目时跳到当前页
      this.handleCurrentChange(1)
    },

    // 页号改变时触发
    handleCurrentChange(val) {
      // 将当前页号给currentPage
      this.currentPage = val

      // 页面变化时调用 查询数据函数
      this.fetchData()
    },
    //序号递增
    indexMethod(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize
    },

    giveTime(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.form.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
      this.form.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
    },

    // 点击统计按钮
    fetchData(p) {
      if (p) {
        this.orderProp = p.prop
        this.order = p.order
      }
      let params = {
        page: this.currentPage,
        pageSize: this.pageSize,
        siteName: '',
        orderProp: this.orderProp,
        //排序 ascending 正序，descending 降序
        asc: this.order == 'ascending'
      }
      if (this.form.beginTime) {
        params['beginTime'] = this.form.beginTime
      }
      if (this.form.endTime) {
        params['endTime'] = this.form.endTime
      }

      this.loading = true
      this.queryButton = true
      this.isNoData = false
      statisticApi.fetchDayStatisticByOrder(params).then((response) => {
        this.tableData = response.data.data.rows
        this.loading = false
        this.queryButton = false
        if (response.data.data.total == 0) {
          this.isNoData = true
          return
        }
        // 移除空数据状态
        this.isNoData = false
        this.total = response.data.data.total
      })
    },
    openDetail(row) {
      const encodedSiteName = encodeURIComponent(row.name)
      const timeType = '0'
      const jumpPage = '2'
      this.$router.push(`/exceptionDetail/${encodedSiteName}/${row.lst}/${timeType}/${jumpPage}`)
    }
  }
}
</script>

<template>
  <el-form :inline="true" :model="form" ref="h1">
    <el-form-item>
      <AreaAndmonitorType></AreaAndmonitorType>
    </el-form-item>
    <el-form-item>
      <TimeShortCuts timeType="currentMonth" @submit-time="giveTime"></TimeShortCuts>
    </el-form-item>
    <el-form-item>
      <ButtonClick
        style="margin-right: 12px"
        content="数据排名"
        type="primary"
        :loading="queryButton"
        @do-search="fetchData"
      ></ButtonClick>
      <ButtonExportExcel
        content="导出数据"
        type="success"
        :loading="exportButton"
        @do-export="exportData"
      ></ButtonExportExcel>
    </el-form-item>
  </el-form>
  <el-card v-show="!isNoData">
    <el-table
      :data="tableData"
      :height="tableHeight"
      style="width: 100%"
      v-loading="loading"
      :cell-class-name="tableCellClassName"
      @sort-change="fetchData"
    >
      <el-table-column
        type="index"
        prop="name"
        label="序号"
        :index="indexMethod"
        fixed
        show-overflow-tooltip
      />
      <el-table-column prop="name" label="点位名称" show-overflow-tooltip width="300">
        <template #default="{ row }">
          <el-button type="primary" text @click="openDetail(row)">
            <span class="rank-site">{{ row.name }}</span></el-button
          >
        </template>
      </el-table-column>
      <el-table-column prop="mnCode" label="设备编码" show-overflow-tooltip />
      <el-table-column prop="lst" label="监测日期" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="dayAvg" label="日平均值" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="min" label="日最小值" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="max" label="日最大值" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="dayOnline" label="日在线率" sortable="custom" show-overflow-tooltip>
        <template #default="{ row }">
          {{ percentFormatter(row.dayOnline) }}
        </template>
      </el-table-column>
      <el-table-column prop="dayValid" label="日有效率" sortable="custom" show-overflow-tooltip>
        <template #default="{ row }">
          {{ percentFormatter(row.dayValid) }}
        </template>
      </el-table-column>
      <el-table-column prop="dayExceeding" label="日超标率" sortable="custom" show-overflow-tooltip>
        <template #default="{ row }">
          {{ percentFormatter(row.dayExceeding) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      ref="h2"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total,sizes, prev, pager, next, jumper"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      @update:current-page="handleCurrentChange"
      @update:page-size="handleSizeChange"
    />
  </el-card>
  <el-empty v-show="isNoData" :image-size="200" />
</template>

<style scoped>
.el-form {
  margin: 20px;
}
.el-card {
  margin: 20px 20px 0px 20px;
}
:deep().el-table__row .warning-row {
  background-color: #f7ba1e;
}
:deep().el-table__row .red-color {
  background-color: red;
}
.el-table {
  color: #333333;
}
.rank-site {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 240px;
}
</style>
