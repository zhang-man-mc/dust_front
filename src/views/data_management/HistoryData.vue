<script>
import TimeShortCuts from '@/sfc/TimeShortCuts.vue'
import ScenarioType from '@/sfc/ScenarioType.vue'
import InputSearch from '@/sfc/InputSearch.vue'
import { ElMessage } from 'element-plus'
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'

import { useCommonFunction } from '../../utils/common.js'
import requetsApi from '@/api/exportExcel/requetsApi.js'
import ButtonClick from '@/sfc/ButtonClick.vue'
import ButtonExportExcel from '@/sfc/ButtonExportExcel.vue'
import dayjs from 'dayjs'

export default {
  components: {
    TimeShortCuts,
    ScenarioType,
    InputSearch,
    ButtonClick,
    ButtonExportExcel,
    AreaAndmonitorType
  },
  data() {
    return {
      form: {
        // 站点名称
        name: '',
        // 设备编号
        number: '',
        // 开始时间
        beginTime: '',
        // 结束时间
        endTime: ''
      },
      // 搜索框传递上来的设备编号
      tempMnCode: '',
      // 返回的数据
      tableData: [],
      // 表格数据
      displayData: [],
      // 当前页
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      total: 0,
      // 加载中
      loading: false,
      queryButton: false,
      exportButton: false,
      // 空状态
      isNoData: false,
      // 已选中的场景类型
      scenarioType: [],
      // 表格高度
      tableHeight: '500',
      // 站点总数量
      siteNums: 0
    }
  },
  setup() {
    const { isExceedOneMonth, exportToExcel } = useCommonFunction()
    return { isExceedOneMonth, exportToExcel }
  },
  mounted() {
    this.backMinuteDataAWeekAgo()
    this.calTableHeight()
  },

  methods: {
    exportDom() {
      let params = {
        beginTime: this.form.beginTime,
        endTime: this.form.endTime
      }
      if (this.form.name) {
        params['siteName'] = this.form.name
      }
      if (this.form.number) {
        params['mnCode'] = this.form.numbe
      }
      if (this.scenarioType.length != 0) {
        params['scenarioType'] = this.scenarioType
      }
      this.exportButton = true
      requetsApi.fetchAlSiteData(params).then((res) => {
        const data = res.data.data
        if (data.length != 0) {
          const tableColumns = [
            'name',
            'address',
            'dutyCompany',
            'mnCode',
            'typeName',
            'dustValue',
            'noiseValue',
            'lst',
            'quality',
            'groupName'
          ]
          const excelColumns = [
            ['A1', '站点名称'],
            ['B1', '地址'],
            ['C1', '供应商'],
            ['D1', '设备编号'],
            ['E1', '类型'],
            ['F1', '扬尘浓度(mg/m³)'],
            ['G1', '噪声(dB)'],
            ['H1', '采集时间'],
            ['I1', '等级'],
            ['J1', '所在区县']
          ]
          this.exportToExcel(data, tableColumns, excelColumns, '历史数据表.xlsx')
        } else {
          ElMessage('无数据需要导出')
        }
        this.exportButton = false
      })
    },
    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      const h2 = this.$refs.h2.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px - ${h2}px - 40px - 40px - var(--el-main-padding) * 2`
    },
    giveTime(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.form.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
      this.form.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
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
      this.handleSubmit()
    },
    //序号递增
    indexMethod(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize
    },

    // 查询数据
    handleSubmit() {
      this.loading = true
      this.queryButton = true
      let params = {}
      params['page'] = this.currentPage
      params['pageSize'] = this.pageSize
      if (this.form.name) {
        params['siteName'] = this.form.name
      }
      if (this.form.number) {
        params['mnCode'] = this.form.number
      }
      params['beginTime'] = this.form.beginTime
      params['endTime'] = this.form.endTime
      if (this.scenarioType.length != 0) {
        params['scenarioType'] = this.scenarioType.join()
      }
      this.$http.get('/dust/history1', { params: params }).then((response) => {
        // 保存返回的
        this.tableData = response.data.data.rows
        this.displayData = this.tableData
        this.loading = false
        this.queryButton = false
        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.loading = false
          this.queryButton = false
          this.isNoData = true
          return
        }
        this.total = response.data.data.total
        // 移除空数据状态
        this.isNoData = false
      })
    },
    backMinuteDataAWeekAgo() {
      // 打开页面加载最近一周的数据
      this.loading = true
      // 给输入框设置默认的选择项

      let params = {}
      params['siteName'] = this.form.name
      params['beginTime'] = this.form.beginTime
      params['endTime'] = this.form.endTime

      this.$http.get('/dust/history1', { params: params }).then((response) => {
        // 保存返回的
        this.tableData = response.data.data.rows;
        this.displayData = this.tableData;
        this.loading = false;
        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isNoData = true
          return
        }
        this.total = response.data.data.total;
       
      });
    }
  }
}
</script>

<template>
  <div class="history-container">
    <el-row>
      <el-col ref="h1" class="head-row">
        <el-card>
          <el-form :inline="true">
            <div class="demo-form-inline">
              <el-row>
                <el-col>
                  <el-form-item>
                    <AreaAndmonitorType></AreaAndmonitorType>
                  </el-form-item>

                  <el-form-item>
                    <InputSearch
                      isNeedDefaultSite="1"
                      @submit-value="(n) => (form.name = n)"
                      @submit-site-nums="(n) => (siteNums = n)"
                    >
                    </InputSearch>
                  </el-form-item>

                  <el-form-item>
                    <template #label>
                      <span class="font-label">设备编码:</span>
                    </template>
                    <el-input v-model="form.number" clearable placeholder="请输入"></el-input>
                  </el-form-item>
                </el-col>

                <el-col>
                  <el-form-item>
                    <TimeShortCuts time-type="week" @submit-time="giveTime"></TimeShortCuts>
                  </el-form-item>

                  <el-form-item>
                    <ScenarioType @submitScenarioType="(val) => (scenarioType = val)">
                    </ScenarioType>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <div class="button-and-export">
              <el-form-item>
                <el-tag class="ml-2" type="success" size="large">点位总数</el-tag>
                <span class="tag-text">{{ siteNums }}</span>
              </el-form-item>

              <el-form-item>
                <ButtonClick
                  style="margin-right: 12px"
                  content="搜索"
                  type="primary"
                  :loading="queryButton"
                  @do-search="handleSubmit"
                ></ButtonClick>
                <ButtonExportExcel
                  content="导出数据"
                  type="success"
                  :loading="exportButton"
                  @do-export="exportDom"
                ></ButtonExportExcel>
              </el-form-item>
            </div>
          </el-form>
        </el-card>
      </el-col>
      <el-col> </el-col>
    </el-row>

    <el-row>
      <el-col v-show="!isNoData">
        <el-table
          border
          size="default"
          :highlight-current-row="true"
          :data="displayData"
          :height="tableHeight"
          v-loading="loading"
        >
          <!--绑定一个方法，将返回值赋给index,即表格每行数据的下标-->
          <el-table-column
            type="index"
            label="序号"
            align="center"
            fixed
            :index="indexMethod"
          ></el-table-column>
          <el-table-column prop="name" label="点位名称" show-overflow-tooltip></el-table-column>
          <el-table-column
            prop="address"
            label="地址"
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="dutyCompany"
            label="运维商"
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column prop="mnCode" label="设备编码" show-overflow-tooltip></el-table-column>
          <el-table-column
            prop="typeName"
            label="类型"
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="dustValue"
            label="TSP(mg/m³)"
            align="center"
            sortable
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="noiseValue"
            label="噪声(dB)"
            align="center"
            sortable
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="lst"
            label="采集时间"
            sortable
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="quality"
            label="等级"
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column prop="groupName" label="所在区县" align="center" show-overflow-tooltip>
          </el-table-column>
        </el-table>
        <!--size-change 是pageSize 改变时会触发的事件,handleSizeChange是事件处理函数
     current-change 是currentPage 改变时会触发的事件    -->

        <el-pagination
          ref="h2"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total,sizes, prev, pager, next, jumper"
          :current-page="currentPage"
        ></el-pagination>
      </el-col>
      <el-empty v-show="isNoData" :image-size="200" />
    </el-row>
  </div>
</template>

<style scoped>
.history-container {
  min-width: 1200px;
}
/* // 整体左外边距 */
.el-row {
  margin-left: 10px;
}

.head-row {
  margin: 10px 0px;
}

.el-card {
  border-radius: 9px;
}

.font-label {
  margin-top: 3px;
  font-weight: bold;
  font-size: 14px;
  color: #333333;
}

.demo-form-inline {
  display: flex;
}

.button-and-export {
  display: flex;
  /* justify-content: flex-end; */
  justify-content: space-between;
  /* 从行尾位置开始排列 */
}

.el-table {
  /* color: #303133 */
  color: rgb(59, 60, 63);
}
.el-pagination {
  margin: 10px 10px;
}
.tag-text {
  margin-left: 10px;
  font-size: 14px;
}
</style>
