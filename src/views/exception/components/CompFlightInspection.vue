<!-- 飞行巡检页面 -->

<script>
import TimeShortCuts from '@/sfc/TimeShortCuts.vue'
import { useCommonFunction } from '@/utils/common.js'
import AreaAndMonitorType from '@/sfc/AreaAndmonitorType.vue'
import ButtonClick from '@/sfc/ButtonClick.vue'
import exceptionApi from '@/api/exceptionApi.js'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import AnalysisCard from '@/views/exception/components/AnalysisCard.vue'
import DutyCompany from '@/sfc/DutyCompany.vue'
import exception0 from '@/assets/exception/exception0.png'
import exception1 from '@/assets/exception/exception1.png'
import exception2 from '@/assets/exception/exception2.png'
import exception3 from '@/assets/exception/exception3.png'
import exception4 from '@/assets/exception/exception4.png'
import exception5 from '@/assets/exception/exception5.png'
import exception6 from '@/assets/exception/exception6.png'
import exception7 from '@/assets/exception/exception7.png'

import CompDialogDetail from '@/views/exception/components/CompDialogDetail.vue'
export default {
  props: {
    // 点位名字
    siteName: {
      type: String,
      default: ''
    },
    // 日时间或者月时间
    time: {
      type: String,
      default: ''
    },
    // 展示页面的全部
    showAll: {
      type: Boolean,
      default: true
    },

    // 0代表日时间，1代表月时间
    timeType: {
      type: Number,
      default: -1
    }
  },
  components: {
    TimeShortCuts,
    ButtonClick,
    AreaAndMonitorType,
    AnalysisCard,
    DutyCompany,
    CompDialogDetail
  },
  data() {
    return {
      //  表单内容
      form: {
        // 运维商
        dutyCompany: [],
        // 街道
        street: [],
        // 选择的异常类型
        exceptionName: []
      },
      beginTime: '',
      endTime: '',
      // 返回的数据
      tableData: [],
      // 表格展示的数据
      displayData: [],
      // 表格高度
      tableHeight: 400,
      // 表格显示
      isTableShow: false,
      // 审核辅助按钮显示
      auditButton: false,
      // 当前页
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      // 表格的总记录数
      total: 0,

      // 查询按钮无数据时
      isNoData: {
        exception0: true,
        exception1: true,
        exception2: true,
        exception3: true,
        exception4: true,
        exception5: true,
        exception6: true,
        exception7: true,
        exception8: true
      },
      // 对话框显示
      dialogTableVisible: false,
      // 保存异常对应的店铺名称和设备编号
      exception: {
        // 断电或断网
        exception0: [],
        // 数据超低
        exception1: [],
        // 超标
        exception2: [],
        // 数据长时段无波动
        exception3: [],
        // 量级突变异常
        exception4: [],
        // 临近超标异常
        exception5: [],
        // 单日超标次数临界异常
        exception6: [],
        // 滑动平均值异常
        exception7: [],
        // 有效率异常
        exception8: [],

        // 该时段的异常数量
        exception0Num: 0,
        exception1Num: 0,
        exception2Num: 0,
        exception3Num: 0,
        exception4Num: 0,
        exception5Num: 0,
        exception6Num: 0,
        exception7Num: 0,
        exception8Num: 0
      },
      // 站点总数量
      siteTotal: 0,

      // 选中表格当前行的数据
      tableCurrentRowData: null,
      // 选中表格当前行的索引
      selectedRowIndex: -2,
      // 页面上的按钮加载状态
      loading: {
        // 查询按钮
        queryButton: false,
        // 表格加载中
        tableLoading: false
      },
      // 标记位
      flag: {
        // 0代表分页，1代表不分页
        originClick: 0
      }
    }
  },
  setup() {
    const { isExceedOneMonth } = useCommonFunction()
    return {
      isExceedOneMonth
    }
  },
  // 监听  判断按钮是否可点击
  watch: {
    // 页面加载时showAll才会变化一次
    // 为true表示的飞行巡检页面
    showAll() {
      if (this.showAll) {
        this.backExceptionDataAWeekAgo()
      }
    },

    timeType() {
      if (this.timeType == '0') {
        this.beginTime = dayjs(this.time).format('YYYY-MM-DD 00:00:00')
        this.endTime = dayjs(this.time).format('YYYY-MM-DD 23:59:59')
      } else if (this.timeType == '1') {
        this.beginTime = dayjs(this.time).startOf('month').format('YYYY-MM-DD HH:mm:ss')
        this.endTime = dayjs(this.time).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      }
      this.backExceptionDataAWeekAgo()
      this.getShopNames()
    }
  },
  computed: {
    // 设置对话框中的按钮是否能被点击
    buttonDisabled() {
      // 表格只有一条数据时
      if (this.selectedRowIndex === 0 && this.selectedRowIndex === this.displayData.length - 1) {
        return { pre: true, next: true }
      } else if (this.selectedRowIndex === 0) {
        return { pre: true, next: false }
      }
      // 处于表格第一条数据 设置‘上一条’按钮不可点
      else if (this.selectedRowIndex === this.displayData.length - 1) {
        return { pre: false, next: true }
      }
      // 处于表格的中间行 将按钮设置为可点击状态
      else {
        return { pre: false, next: false }
      }
    },
    exceptionAllNum() {
      let sum =
        this.exception.exception0Num +
        this.exception.exception1Num +
        this.exception.exception2Num +
        this.exception.exception3Num +
        this.exception.exception4Num +
        this.exception.exception5Num +
        this.exception.exception6Num +
        this.exception.exception7Num +
        this.exception.exception8Num
      if (sum == 0) {
        return 1
      } else {
        return sum
      }
    },

    // 卡片数据
    cardRow() {
      return [
        {
          siteName: this.exception.exception4,
          exceptionType: '4',
          exceptionName: '量级突变',
          iconSrc: exception4,
          siteNum: this.exception.exception4.length,
          exceptionNum: this.exception.exception4Num,
          isNoDataStatus: this.isNoData.exception4,
          span: 5
        },
        {
          siteName: this.exception.exception5,
          exceptionType: '5',
          exceptionName: '临近超标异常',
          iconSrc: exception5,
          siteNum: this.exception.exception5.length,
          exceptionNum: this.exception.exception5Num,
          isNoDataStatus: this.isNoData.exception5,
          span: 5
        },
        {
          siteName: this.exception.exception8,
          exceptionType: '8',
          exceptionName: '有效率异常',
          iconSrc: exception0,
          siteNum: this.exception.exception8.length,
          exceptionNum: this.exception.exception8Num,
          isNoDataStatus: this.isNoData.exception8,
          span: 5
        },
        {
          siteName: this.exception.exception6,
          exceptionType: '6',
          exceptionName: '单日超标次数临界异常',
          iconSrc: exception6,
          siteNum: this.exception.exception6.length,
          exceptionNum: this.exception.exception6Num,
          isNoDataStatus: this.isNoData.exception6,
          span: 5
        },

        {
          siteName: this.exception.exception7,
          exceptionType: '7',
          exceptionName: '变化趋势异常',
          iconSrc: exception7,
          siteNum: this.exception.exception7.length,
          exceptionNum: this.exception.exception7Num,
          isNoDataStatus: this.isNoData.exception7,
          span: 4
        },
        {
          siteName: this.exception.exception0,
          exceptionType: '0',
          exceptionName: '数据缺失异常',
          iconSrc: exception0,
          siteNum: this.exception.exception0.length,
          exceptionNum: this.exception.exception0Num,
          isNoDataStatus: this.isNoData.exception0,
          span: 6
        },
        {
          siteName: this.exception.exception1,
          exceptionType: '1',
          exceptionName: '数据超低',
          iconSrc: exception1,
          siteNum: this.exception.exception1.length,
          exceptionNum: this.exception.exception1Num,
          isNoDataStatus: this.isNoData.exception1,
          span: 6
        },
        {
          siteName: this.exception.exception2,
          exceptionType: '2',
          exceptionName: '超标',
          iconSrc: exception2,
          siteNum: this.exception.exception2.length,
          exceptionNum: this.exception.exception2Num,
          isNoDataStatus: this.isNoData.exception2,
          span: 6
        },
        {
          siteName: this.exception.exception3,
          exceptionType: '3',
          exceptionName: '数据长时段无波动',
          iconSrc: exception3,
          siteNum: this.exception.exception3.length,
          exceptionNum: this.exception.exception3Num,
          isNoDataStatus: this.isNoData.exception3,
          span: 6
        }
      ]
    }
  },
  mounted() {
    this.getSiteNum()

    // 飞行巡检页面，进去加载
    if (this.showAll == true) {
      this.backExceptionDataAWeekAgo()
      this.getShopNames()
    }
  },

  methods: {
    // 放回站点总数量
    getSiteNum() {
      exceptionApi.getSitesNum().then((res) => {
        this.siteTotal = res.data.data.length
      })
    },

    /**
     * description：点击异常站点名字时 返回的数据
     * @param：
     * @createTime:2023-08-17
     * @returns：
     */
    getAbnormalDataByClick(val) {
      this.flag.originClick = 1
      // 显示表格
      this.isTableShow = true
      this.tableData = val
      this.total = this.tableData.length
      // 默认显示第一页
      this.handleCurrentChange(1)
    },

    // 段电或断网区间无数据，需要补充。其他的都有数据，直接一次请求全部时段就好

    // 根据异常区间构造前后端首尾 前区间 中间区间 后区间
    // 判断是段电或断网？是则请求前后区间，否则只请求一次完整的
    // 得到最终数据
    // 再判断异常种类 ，进行设置配置项

    /**
     * description：获取下一条异常信息
     */
    getPreviousRowData() {
      this.selectedRowIndex < this.displayData.length - 1
        ? this.showDialog(this.selectedRowIndex + 1)
        : ''
    },
    /**
     * description：获取下一条异常信息
     */
    getNextRowData() {
      this.selectedRowIndex > 0 ? this.showDialog(this.selectedRowIndex - 1) : ''
    },

    /**
     * description：从子组件获得某站点该时段的异常数据
     * @createTime:2023-08-18
     */
    backExceptionData(val1, val2) {
      this.displayData = val1
      this.total = val2
    },

    // 查询异常数据的站点名字和数量
    queryExceptionSite(url, exceptionType) {
      let params = {}
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime
      params['exceptionType'] = exceptionType

      if (this.siteName) {
        params['siteName'] = this.siteName
      }
      if (this.form.dutyCompany.length != 0) {
        params['dutyCompany'] = this.form.dutyCompany.join()
      }
      return this.$http.get(url, { params: params })
    },

    /**
     * description：当用户改变查询的时间区间时，会根据该区间查询各异常的站点，查询该时间区间的各异常数量
     * @createTime:2023-08-18
     */
    getShopNames() {
      /* 查询异常的站点 */
      this.queryExceptionSite('/dust/sitenamecode', 0).then((result) => {
        this.exception.exception0 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception0 = true
          return
        }
        this.isNoData.exception0 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 1).then((result) => {
        this.exception.exception1 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception1 = true
          return
        }
        this.isNoData.exception1 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 2).then((result) => {
        this.exception.exception2 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception2 = true
          return
        }
        this.isNoData.exception2 = false
      })

      this.queryExceptionSite('/dust/sitenamecode', 3).then((result) => {
        this.exception.exception3 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception3 = true
          return
        }
        this.isNoData.exception3 = false
      })

      this.queryExceptionSite('/dust/sitenamecode', 4).then((result) => {
        this.exception.exception4 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception4 = true
          return
        }
        this.isNoData.exception4 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 5).then((result) => {
        this.exception.exception5 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception5 = true
          return
        }
        this.isNoData.exception5 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 6).then((result) => {
        this.exception.exception6 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception6 = true
          return
        }
        this.isNoData.exception6 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 7).then((result) => {
        this.exception.exception7 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception7 = true
          return
        }
        this.isNoData.exception7 = false
      })
      this.queryExceptionSite('/dust/sitenamecode', 8).then((result) => {
        this.exception.exception8 = result.data.data
        if (result.data.data.length == 0) {
          this.isNoData.exception8 = true
          return
        }

        this.isNoData.exception8 = false
      })

      /* 异常异常数量 */
      this.queryExceptionSite('/dust/exceptionnum', 0).then((result) => {
        this.exception.exception0Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 1).then((result) => {
        this.exception.exception1Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 2).then((result) => {
        this.exception.exception2Num = result.data.data
      })

      this.queryExceptionSite('/dust/exceptionnum', 3).then((result) => {
        this.exception.exception3Num = result.data.data
      })

      this.queryExceptionSite('/dust/exceptionnum', 4).then((result) => {
        this.exception.exception4Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 5).then((result) => {
        this.exception.exception5Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 6).then((result) => {
        this.exception.exception6Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 7).then((result) => {
        this.exception.exception7Num = result.data.data
      })
      this.queryExceptionSite('/dust/exceptionnum', 8).then((result) => {
        this.exception.exception8Num = result.data.data
      })
    },

    /**
     * description：显示对话框,返回该异常时间段的所有数据
     * @param：点击‘查看详情’的该行所有字段数据
     * @createTime:2023-08-18
     */
    showDialog(rowIndex) {
      // 当前表格行的索引
      this.selectedRowIndex = rowIndex

      // 打开对话框
      this.dialogTableVisible = true

      this.tableCurrentRowData = this.displayData[rowIndex]
    },
    /**
     * description：条件查询异常的数据
     * @createTime:2023-08-18
     */
    handleSubmit() {
      if (this.isExceedOneMonth(this.beginTime, this.endTime)) {
        alert('时间跨度不能超过一个月')
        return
      }
      // 更新异常分析
      this.getShopNames()

      this.loading.queryButton = true
      this.flag.originClick = 0
      this.loading.tableLoading = true
      let params = {}
      params['page'] = this.currentPage
      params['pageSize'] = this.pageSize
      if (this.siteName) {
        params['siteName'] = this.siteName
      }

      if (this.form.dutyCompany.length != 0) {
        params['dutyCompany'] = this.form.dutyCompany.join()
      }
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime

      this.$http.get('/dust/exceptiondata2', { params: params }).then((response) => {
        // 保存返回的
        this.displayData = response.data.data.rows
        this.loading.queryButton = false
        this.loading.tableLoading = false

        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isTableShow = false
          return
        }
        this.isTableShow = true
        this.total = response.data.data.total
        // 移除空数据状态
      })
    },

    /**
     * description：打开页面默认加载最近一周的异常数据
     * @createTime:2023-08-18
     */
    backExceptionDataAWeekAgo() {
      this.loading.tableLoading = true
      let params = {}
      if (this.siteName) {
        params['siteName'] = this.siteName
      }

      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime
      this.$http.get('/dust/exceptiondata', { params: params }).then((response) => {
        // 保存返回的
        this.displayData = response.data.data.rows
        this.loading.tableLoading = false

        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isTableShow = false
          return
        }

        this.isTableShow = true
        this.total = response.data.data.total
      })
    },

    /**
     * description：将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
     * @createTime:2023-08-17
     */
    giveTime(val) {
      this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
    },

    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      const h2 = this.$refs.h2.$el.offsetHeight
      const h3 = this.$refs.h3.$el.offsetHeight
      const h4 = this.$refs.h4.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px - ${h2}px - ${h3}px - ${h4}px - 40px - var(--el-main-padding) * 2)`
    },

    // 页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val

      // 改变每页显示数目时跳到当前页
      this.handleCurrentChange(1)
    },

    // 页号改变时触发
    /**
     * description：页号改变时触发
     * @param： 当前页，标记位（0代表是点击‘查询’触发的，1代表时点击异常站点文本按钮触发的）
     * @createTime:2023-08-17
     * @returns：
     */
    handleCurrentChange(val) {
      // 将当前页号给currentPage
      this.currentPage = val

      // 页面变化时调用 查询数据函数
      if (this.flag.originClick == 0) {
        this.handleSubmit()
      } else if (this.flag.originClick == 1) {
        const startIndex = (val - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize

        this.displayData = this.tableData.slice(startIndex, endIndex)
      }
    },
    // 表格序号递增
    indexMethod1(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize
    }
  }
}
</script>

<template>
  <div class="all-container">
    <el-row ref="h1">
      <el-col>
        <el-form :inline="true">
          <div class="head-container-text">
            <el-form-item>
              <AreaAndMonitorType></AreaAndMonitorType>
            </el-form-item>

            <el-form-item v-show="!showAll">
              <span class="site-text"> 点位名称:</span>
              <span> {{ this.siteName }}</span>
            </el-form-item>

            <el-form-item v-show="showAll">
              <DutyCompany @submitDutyCompanyValue="(n) => (form.dutyCompany = n)"> </DutyCompany>
            </el-form-item>

            <!-- <el-form-item v-show="showAll">
                <StreetInfo @submitStreetValue="(n) => (form.street = n)"> </StreetInfo>
              </el-form-item> -->

            <el-form-item>
              <TimeShortCuts
                timeType="day"
                @submit-time="giveTime"
                :beginAndEndTime="[beginTime, endTime]"
              ></TimeShortCuts>
            </el-form-item>

            <el-form-item>
              <ButtonClick
                content="风险评估"
                type="warning"
                color="rgb(12,104,165)"
                :loading="loading.queryButton"
                :havaIcon="false"
                @do-search="handleSubmit"
                ><img src="@/assets/exception/riskButton.png" height="24" class="img-button"
              /></ButtonClick>
            </el-form-item>
          </div>
        </el-form>
      </el-col>
    </el-row>

    <!-- 时间摘要 -->
    <el-row class="head-description-text" ref="h2">
      <el-row>
        <span> 金山区 {{ beginTime }} —— {{ endTime }} 扬尘监测异常信息汇总</span>
      </el-row>
    </el-row>

    <!-- 异常分析 -->
    <el-row ref="h3">
      <el-col>
        <el-card class="card-container">
          <template #header>
            <div class="card-header">异常分析</div>
          </template>

          <el-row :gutter="20">
            <el-col v-for="item in cardRow" :key="item.exceptionType" :span="item.span">
              <AnalysisCard
                :site-name="item.siteName"
                :exception-type="item.exceptionType"
                :begin-time="beginTime"
                :end-time="endTime"
                :exception-name="item.exceptionName"
                :site-num="item.siteNum"
                :exception-num="item.exceptionNum"
                :exception-all-num="exceptionAllNum"
                :site-num-all="siteTotal"
                :isNoDataStatus="item.isNoDataStatus"
                :icon="item.iconSrc"
                @get-abnormal-data-by-click="getAbnormalDataByClick"
                class="card-row"
              >
                >
              </AnalysisCard>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-button-group>
      <el-button color="#626aef" plain @click="isTableShow = true" v-show="!isTableShow">
        显示异常清单<el-icon class="i-ep-Arrow"><i-ep-ArrowUp /></el-icon>
      </el-button>
      <el-button color="#626aef" plain @click="isTableShow = false" v-show="isTableShow">
        隐藏异常清单<el-icon class="i-ep-Arrow"><i-ep-ArrowDown /></el-icon>
      </el-button>
    </el-button-group>

    <!-- 表格 -->
    <el-row v-show="isTableShow">
      <el-col>
        <el-table
          ref="table"
          :data="displayData"
          :height="tableHeight"
          :highlight-current-row="true"
          size="default"
          v-loading="loading.tableLoading"
          border
        >
          <el-table-column
            type="index"
            label="序号"
            width="60px"
            align="center"
            fixed
            :index="indexMethod1"
          />
          <el-table-column prop="name" label="点位名称" show-overflow-tooltip />
          <el-table-column prop="mnCode" label="设备编码" align="center" show-overflow-tooltip />
          <el-table-column prop="exception" label="异常类型" align="center" show-overflow-tooltip />
          <el-table-column prop="region" label="区县" align="center" show-overflow-tooltip />
          <el-table-column prop="beginTime" label="开始时间" align="center" show-overflow-tooltip />
          <el-table-column prop="endTime" label="结束时间" align="center" show-overflow-tooltip />
          <el-table-column
            prop="typename"
            label="场景"
            align="center"
            width="82"
            show-overflow-tooltip
          />
          <el-table-column prop="address" label="地址" align="center" show-overflow-tooltip />
          <el-table-column prop="dutyCompany" label="运维商" align="center" show-overflow-tooltip />

          <el-table-column label="操作" align="center">
            <template #default="{ $index }">
              <el-button type="primary" class="table-button" @click="showDialog($index)"
                >查看详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          ref="h4"
          background
          layout="total, sizes, prev, pager, next, jumper"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </el-col>
    </el-row>
    <CompDialogDetail
      :row="tableCurrentRowData"
      :button-disabled="buttonDisabled"
      v-model="dialogTableVisible"
      @get-pre-row-data="getNextRowData"
      @get-next-row-data="getPreviousRowData"
    />
  </div>
</template>

<style lang="scss" scoped>
.el-row {
  margin-left: 10px;
}

/* 条件查询模块的样式 */
.el-form {
  margin: 10px;
}

img {
  margin-right: 5px;
}

.head-description-text {
  justify-content: flex-end;
  margin-bottom: 2px;
  margin-right: 20px;
  font-size: 14px;
  color: gray;
}
/* 条件查询模块结束 */

/* 异常分析模块的样式 */
.card-header {
  margin-left: 5px;
  font-size: 18px;
  font-weight: bold;
}

.card-row {
  margin-bottom: 10px;
}
/* 异常分析模块结束 */

/* 隐藏表格按钮组样式 */
.el-button-group {
  margin: 10px 0px 10px 10px;
}

.i-ep-Arrow {
  margin-left: 6px;
  margin-bottom: 2px;
  font-size: 1.2em;
}
/* 隐藏表格按钮组样式结束 */

/* 表格模块的样式 */
.el-table {
  color: #333333;
}
/* 表格模块结束 */
</style>
