<script>
import InputSearch from '@/sfc/InputSearch.vue'
import ExceptionType from '@/sfc/ExceptionType.vue'
import TimeShortCuts from '@/sfc/TimeShortCuts.vue'
import { useCommonFunction } from '../../utils/common.js'
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import { defineAsyncComponent } from 'vue'
//  异常图形异步组件
const DustLineChart = defineAsyncComponent(() => import('./components/DustLineChart.vue'))
import submitApi from '@/api/audit/submitApi.js'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import ButtonClick from '@/sfc/ButtonClick.vue'
import index from '@/utils/exception_common_function/index.js'
import DaySelect from '@/sfc/DaySelect.vue';
// import {useLoginUserStore} from '@/stores/user.js'
import { useLoginUserStore } from '@/stores/user'
import historyApi from '@/api/historyApi.js'
import time from '@/utils/time.js'
import lineChart from '@/utils/chartFunction/lineChart.js'
import exceptionOption from '@/utils/chartFunction/exceptionOption.js'

export default {
  components: {
    ExceptionType,
    InputSearch,
    TimeShortCuts,
    DustLineChart,
    AreaAndmonitorType,
    ButtonClick,
    DaySelect
  },
  data() {
    return {
      //  表单内容
      form: {
        // 站点名称
        name: '',
        // 选择的异常类型
        exceptionName: []
      },
      // 日期选择
      day:'',
      // 日期时间选择
      beginTime: '',
      endTime: '',
      // 返回的数据
      tableData: [],
      // 表格展示的数据
      displayData: [],
      // 表格列多选
      multipleSelection: [],
      // 表格高度
      tableHeight: 400,
      // 表格数据
      // 当前页
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      total: 0,

      // 表格查询无数据时
      isNoData: false,
      // 对话框显示
      dialogTableVisible: false,
      // 保存异常对应的店铺名称和设备编号

      // 选中表格当前行的数据
      tableCurrentRowData: null,
      // 选中表格当前行的索引
      selectedRowIndex: -2,
      // 页面上的按钮加载状态
      loading: {
        submitAudit: false,
        // 查询按钮
        queryButton: false,
        // 表格加载中
        tableLoading: false,
        // 上一条按钮
        preButton: false,
        // 下一条按钮
        afterButton: false,
        // 折线图
        lineChart: false
      },

      dialog: {
        // 打开对话框请求该区间的历史数据
        historyData: [],
        // 该时间段的异常条数
        exceptionTotal: 0,
        // 折线图配置项
        option: {},
        // ’上一条‘按钮是否可以被点击状态
        isPreCantouch: false,
        // ’下一条‘按钮是否可以被点击状态
        isNextCantouch: false,
        // 异常的前中后区间所有数据
        allExceptionTimeData: []
      },

      // 标记位
      flag: {
        // 加载时 上下条按钮不能再点击
        banTouch: 0,
        // 0代表分页，1代表不分页
        originClick: 0
      },
      auditDialog: {
        visible: false,
        // 审核人
        checker: 'admin',
        checkDate: '',
        checkerNotes: '',
        enterpriseNotes: ''
      },
      auditTableData: [],
      // 审核状态不为0
      auditData: []
    }
  },
  setup() {
    const { isExceedOneMonth } = useCommonFunction()
    const userName = useLoginUserStore()

    return {
      isExceedOneMonth,userName
    }
  },
  // 监听  判断按钮是否可点击
  watch: {
    selectedRowIndex(newVaue) {
        // 处于表格的最后一条数据 设置‘上一条’按钮不可点
        if (newVaue === 0) {
          this.dialog.isPreCantouch = true
        //用户先点了第一条，pre为true,然后点击最后一条,next为true。此时两个按钮都被封锁
        if (this.dialog.isNextCantouch == true) {
          this.dialog.isNextCantouch = false
        }
      }
      // 处于表格第一条数据 设置‘上一条’按钮不可点
      else if (newVaue === this.displayData.length - 1) {
        this.dialog.isNextCantouch = true
        //用户先点了表格最后一条,next为true,然后点击第一条，pre为true。此时两个按钮都被封锁
        if (this.dialog.isPreCantouch == true) {
          this.dialog.isPreCantouch = false
        }
      }
      // 处于表格的中间行 将按钮设置为可点击状态
      else {
        this.dialog.isPreCantouch = false
        this.dialog.isNextCantouch = false
      }

    },

    dialogTableVisible() {
      window.addEventListener('resize', this.updateChart)
    }
  },
  computed: {
    // 审计总数（包括部分审核）
    auditTotal() {
      return this.auditData.length
    },
    // 规范审计总数
    auditedRegular() {
      let count = 0
      this.auditData.forEach((item) => {
        if (item.auditStatus == 3) {
          count++
        }
      })
      return count
    },
    // 部分审核数量
    auditPart() {
      let count = 0
      this.auditData.forEach((item) => {
        if (item.auditStatus == 1 || item.auditStatus == 2) {
          count++
        }
      })
      return count
    },
    // 待审核数
    unCheckedNUm() {
      return this.total - this.auditedRegular
    },
    // 审核比例
    checkedRate() {
      if (this.total == 0) {
        return 0
      } else {
        return ((this.auditedRegular / this.total) * 100).toFixed(1)
      }
    }
  },
  mounted() {
    this.backExceptionDataAWeekAgo()
    this.calTableHeight()
 
  },

  methods: {
        /**
     * 有效率异常 设置折线图配置项
     * @param： 
     * @returns：
     */
    validProcess() {
      // x轴数据
      let xList = time.ascTime(
        this.tableCurrentRowData.beginTime,
        this.tableCurrentRowData.endTime,
        15
      )

      // y轴数据
      let yList = []
      xList.forEach((item) => {
        // 查找该时间的数据
        let r = lineChart.findDate(this.dialog.historyData, item)
        if (r) {
          yList.push(r.dustValue)
        } else {
          yList.push(null)
        }
      })
      // 颜色背景区间
      // 得到无数据的时间点或flag不等于N的时间点
      let noDataTime = time.invalidTime(this.dialog.historyData, xList)
      let rangeTime = time.seriesTime(noDataTime, 15)
      // let rangeTime_1 = time.splitTime(rangeTime)
      // 得到背景区间的配置
      let areaObj = lineChart.getMarkArea(rangeTime, '异常')

      // 传入参数
      this.dialog.option = exceptionOption.setExceptionChartOption(
        xList,
        yList,
        '',
        '',
        '',
        '',
        this.tableCurrentRowData.exception,
        areaObj,
        '',
        this.tableCurrentRowData.exceptionType
      )
    },

    giveDay(val){
      // 将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)

        this.beginTime = dayjs(val).format('YYYY-MM-DD 00:00:00');
        this.endTime = dayjs(val).format('YYYY-MM-DD 23:59:59');
    },

    /**
     * 审计内容保存为草稿
     * @param：
     * @returns：
     */
    saveAudit() {
      // 将输入框值给当前行
      this.tableCurrentRowData.checkerContent = this.auditDialog.checkerNotes
      this.tableCurrentRowData.enterpriseContent = this.auditDialog.enterpriseNotes
      ElMessage.success('保存成功')
    },
    /**
     * 查看该段时间内已审核的数据
     * @param：
     * @returns：
     */
    gethasCheckedNumByTime() {
      submitApi.getAuditNumByTime(this.beginTime, this.endTime).then((res) => {
        this.auditData = res.data.data
      })
    },

    /**
     * 多选列（已审核的行不会加入其中）
     * @param
     * @returns
     */
    handleSelectionChange(val) {
      this.multipleSelection = val.filter((row) => row.auditStatus != 3)
    },
    /**
     * 触发批量审核
     * @param：
     * @returns：
     */
    quickReview() {
      if (this.multipleSelection.length != 0) {
        ElMessageBox.confirm('确定要批量审核吗?', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.noNoteCheck(this.multipleSelection)
          setTimeout(() => {
            this.gethasCheckedNumByTime()
            ElMessage.success('批量审核完成')
          }, 1500)
        })
      } else {
        ElMessage('未选中表格的行')
      }
    },
    /**
     * 清除已选中的表格行：
     * @param：
     * @returns：
     */
    clearSelected() {
      this.$refs.table.clearSelection()
    },
    toggleSelection() {
      this.$refs.table.clearSelection()
    },
    /**
     *提交批量审核。默认审核人，空备注
     * @param： 需要快速审核的行
     * @returns：
     */
    noNoteCheck(rows) {
      rows.forEach((item) => {
        submitApi.submitAudit('admin', '无', '无', item.id, 3)
        item.auditStatus = 3
      })
    },
    close() {
      
      this.auditDialog.visible = false
    },
    // 表格行的颜色
    tableRowClassName({ row }) {
      if (row.auditStatus == 0) {
        return 'black-row'
      } else if (row.auditStatus == 1 || row.auditStatus == 2) {
        return 'deep-gray-row'
      } else {
        return 'complete--gray-row'
      }
    },
    /**
     * 发请求
     * @param：审核人，审核人备注，企业备注，异常记录编号 该条异常的审核状态
     * @returns：
     */
    sendAudit(user, checker, enterprise, exceptionId, status) {
      submitApi
        .submitAudit(
          user,
          this.auditDialog.checkerNotes,
          this.auditDialog.enterpriseNotes,
          exceptionId,
          status
        )
        .then((res) => {
          if (res.data.code == 1) {
            ElMessage.success('提交成功')
            this.tableCurrentRowData.auditStatus = status
            this.tableCurrentRowData.checker = user
            if (checker) {
              this.tableCurrentRowData.checkerContent = checker
            }
            if (enterprise) {
              this.tableCurrentRowData.enterpriseContent = enterprise
            }

            // 更新分析的数据
            setTimeout(() => {
              this.gethasCheckedNumByTime()
            }, 1500)
          } else {
            ElMessage.warning('提交失败')
          }
          this.loading.submitAudit = false
          this.auditDialog.visible = false
        })
    },
    // 更新审核内容
    updateAud(exceptionId, checkerContent, enterpriseContent, auditStatus) {
      submitApi
        .updateAudit(exceptionId, checkerContent, enterpriseContent, auditStatus)
        .then((res) => {
          if (res.data.code == 1) {
            ElMessage.success('提交成功')
            this.tableCurrentRowData.auditStatus = auditStatus

            if (checkerContent) {
              this.tableCurrentRowData.checkerContent = checkerContent
            }
            if (enterpriseContent) {
              this.tableCurrentRowData.enterpriseContent = enterpriseContent
            }

            // 更新分析的数据
            setTimeout(() => {
              this.gethasCheckedNumByTime()
            }, 1500)
          } else {
            ElMessage.warning('提交失败')
          }
          this.loading.submitAudit = false
          this.auditDialog.visible = false
        })
    },
    /**
     * 提交审核
     * @param：
     * @returns：
     */
    submitAudit() {
      // 同时填写了审核人员和企业的备注
      this.loading.submitAudit = true
      // 把登陆的用户姓名给审核人
      if(this.userName.getUserName != '-1'){
        this.auditDialog.checker = this.userName.getUserName
      }
      if (this.auditDialog.checkerNotes && this.auditDialog.enterpriseNotes) {
        this.sendAudit(
          this.auditDialog.checker,
          this.auditDialog.checkerNotes,
          this.auditDialog.enterpriseNotes,
          this.tableCurrentRowData.id,
          3
        )
      }
      // 只填了审核人员备注
      else if (this.auditDialog.checkerNotes && !this.auditDialog.enterpriseNotes) {
        // 第一次创建
        if (this.tableCurrentRowData.auditStatus == 0) {
          this.sendAudit(
            this.auditDialog.checker,
            this.auditDialog.checkerNotes,
            this.auditDialog.enterpriseNotes,
            this.tableCurrentRowData.id,
            1
          )
        }
        // 只更新
        else {
          this.updateAud(
            this.tableCurrentRowData.id,
            this.auditDialog.checkerNotes,
            this.auditDialog.enterpriseNotes,
            3
          )
        }
      }
      // 只填了企业备注备注
      else if (this.auditDialog.enterpriseNotes && !this.auditDialog.checkerNotes) {
        // 第一次创建
        if (this.tableCurrentRowData.auditStatus == 0) {
          this.sendAudit(
            this.auditDialog.checker,
            this.auditDialog.checkerNotes,
            this.auditDialog.enterpriseNotes,
            this.tableCurrentRowData.id,
            2
          )
        } else {
          // 只更新
          this.updateAud(
            this.tableCurrentRowData.id,
            this.auditDialog.checkerNotes,
            this.auditDialog.enterpriseNotes,
            3
          )
        }
      } else {
        ElMessage.warning('请填写完整才能提交')
      }

      this.loading.submitAudit = false
      // 清除
      this.auditDialog.checkerNotes = ''
      this.auditDialog.enterpriseNotes = ''
    },

    /**
     * 弹出对话框并且保存当前行数据
     * @param：
     * @createTime:2023-08-17
     * @returns：
     */
    openAuditDiag(row) {
      this.auditDialog.visible = true
      this.tableCurrentRowData = row
      // 进入审核页时，将表格当前行的审核信息给输入框
      this.auditDialog.checkerNotes = this.tableCurrentRowData.checkerContent
      this.auditDialog.enterpriseNotes = this.tableCurrentRowData.enterpriseContent
      
      // // 未审核  就把当前登陆名给审核人
      // if(this.tableCurrentRowData.uiRealName == null){
      //   this.auditDialog.checker = this.userName.getUserName
      // }
      // // 已审核
      // else{
      //   this.auditDialog.checker = this.tableCurrentRowData.uiRealName
      // }

    },


    /**
     * description：点击异常站点名字时 返回的数据
     * @param：
     * @createTime:2023-08-17
     * @returns：
     */
    getAbnormalDataByClick(val) {
      this.flag.originClick = 1

      this.tableData = val
      this.total = this.tableData.length
      // 默认显示第一页
      this.handleCurrentChange(1)
    },
    // 点击表格的行时
    selectTableRow() {
      // 获取当前行的索引
      this.selectedRowIndex = this.displayData.indexOf(this.tableCurrentRowData)
    },

    /**
     * description：断电或断网时设置的表格数据
     */
    setOfflineTbleData() {
      // 无数据时的时间数组 时间相差15分钟
      const abnormalTimeTenMinute = index.descFiftyTime(
        this.tableCurrentRowData.beginTime,
        this.tableCurrentRowData.endTime
      )

      // 保存无数据时表格条数
      this.dialog.exceptionTotal = abnormalTimeTenMinute.length

      // 去除供电异常和掉线区间的第一个有元素的值
      this.dialog.historyData = []

      for (let i = 0; i < abnormalTimeTenMinute.length; i++) {
        this.dialog.historyData.push({
          name: this.tableCurrentRowData.name,
          mnCode: this.tableCurrentRowData.mnCode,
          dutyCompany: this.tableCurrentRowData.dutyCompany,
          lst: abnormalTimeTenMinute[i],
          dustValue: ''
        })
      }
    },

    // 段电或断网区间无数据，需要补充。其他的都有数据，直接一次请求全部时段就好

    // 根据异常区间构造前后端首尾 前区间 中间区间 后区间
    // 判断是段电或断网？是则请求前后区间，否则只请求一次完整的
    // 得到最终数据
    // 再判断异常种类 ，进行设置配置项

    /**
     * description：一次请求回前中后区间的数据,对数据进行分析
     * @param： 前中后区间的请求参数，前中后的总区间时间，异常开始时间，一场结束时间
     */
    otherExceptionRequest(allTimeArgs, allTime, exceptionBT, exceptionET) {
      // 折线图加载中效果
      this.loading.lineChart = true
      this.$http.get('/dust/history', { params: allTimeArgs }).then((result) => {
        this.dialog.allExceptionTimeData = result.data.data
        //  断电或断网时重新设置表格
        if (this.tableCurrentRowData.exceptionType == '0') {
          this.setOfflineTbleData()
        }

        // x轴日期时间
        let dateList = []
        // y轴 超标油烟浓度
        let dustValue = []
        let timeAndValue = {}

        // 从添加了首位区间的开始和结束时间进行遍历 保证时间以10分钟为间隔
        timeAndValue = index.keepContinuousByEachFiftyMinutes(
          allTime[0],
          allTime[3],
          this.dialog.allExceptionTimeData
        )
        dateList = timeAndValue['xAxis']
        dustValue = timeAndValue['yAxis']

        // 提取异常起始时间点在整个区间内的数据索引
        let startIndex = dateList.findIndex((item) => item === exceptionBT)
        let endIndex = dateList.findIndex((item) => item === exceptionET)

        // 设置折线图配置项
        this.reSetChart(dateList, dustValue, exceptionBT, exceptionET, startIndex, endIndex)
        this.loading.lineChart = false
      })
    },

    /**
     * description：绘制折线图
     * @param： x轴时间， y轴油烟浓度， 异常开始时间，异常结束时间，异常开始时间在整个区间的索引下标，异常结束时间在整个区间的索引下标
     */
    reSetChart(xData, yData, exceptionBeginTime, exceptionEndTime, beginIndex, endIndex) {
      this.dialog.option = {}
      switch (this.tableCurrentRowData.exceptionType) {
        // 断电或断网  时间段
        case '0':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
         
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                // dataZoom: {
                //   // 区域缩放
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData,
                markLine: {
                  silent: true,
                  data: [
                    // 标注无数据时间段的效果，将这个时间段的数轴部分变为红色
                    {
                      name: '无数据',
                      xAxis: exceptionBeginTime
                    },
                    {
                      xAxis: exceptionEndTime
                    }
                  ],
                  lineStyle: {
                    color: 'red'
                  }
                }
              }
            ]
          }
          break
        // 超标
        case '2':
        case '5':
        case '6':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //     dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item >= 1) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                },
                markLine: {
                  symbol: 'none',
                  itemStyle: {
                    // 基线公共样式
                    normal: {
                      lineStyle: {
                        type: 'dashed'
                      },
                      label: {
                        show: true,
                        position: 'end',
                        formatter: '{b}'
                      }
                    }
                  },
                  data: [
                    {
                      name: '超标',
                      type: 'average',
                      yAxis: 1,
                      lineStyle: {
                        // color: '#ff0000'
                        color: 'red'
                      }
                    }
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        // 数据超低 只有时间点
        case '1':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //     dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item <= 0.01) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),

                markLine: {
                  symbol: 'none',
                  itemStyle: {
                    // 基线公共样式
                    normal: {
                      lineStyle: {
                        type: 'dashed'
                      },
                      label: {
                        show: true,
                        position: 'end',
                        formatter: '{b}'
                      }
                    }
                  },
                  data: [
                    {
                      name: '数据超低',
                      type: 'average',
                      yAxis: 0.01,
                      lineStyle: {
                        // color: '#ff0000'
                        color: 'red'
                      }
                    }
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        case '3':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //  dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item >= 1) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        case '4':
        case '7':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
    
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData,
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        default:
          console.log('没有设置该异常类型！')
      }
      this.flag.banTouch = 0
    },
    /**
     * description：划分出异常起始时间，构造请求前中后的参数
     */
    timeAndDataProcessed() {
      //异常的开始时间 结束时间
      let exceptionBeginTime = this.tableCurrentRowData.beginTime
      let exceptionEndTime = this.tableCurrentRowData.endTime

      // beforeAndAfterTime[0]:前45分钟的时间点
      // beforeAndAfterTime[1]:前15分钟的时间点
      // beforeAndAfterTime[2]:后15分钟的时间点
      // beforeAndAfterTime[3]:后45分钟的时间点
      let beforeAndAfterTime = index.before45AndAfter45(exceptionBeginTime, exceptionEndTime)

      // 构造异常时间前后区间数据请求参数(除了断网中都用到）
      let paramsAllTime = index.requestGetParms(
        this.tableCurrentRowData.name,
        beforeAndAfterTime[0],
        beforeAndAfterTime[3]
      )
      // 将异常数据进行预处理，随后将结果作为折线图的配置项

      this.otherExceptionRequest(
        paramsAllTime,
        beforeAndAfterTime,
        exceptionBeginTime,
        exceptionEndTime
      )
    },

    /**
     * description：获取下一条异常信息
     */
    getPreviousRowData() {
      //     // 不是表格的最后一行
      if (this.selectedRowIndex < this.displayData.length - 1) {
        // 点击过程中 锁住上下条按钮  在设置完图形配置项后解锁
        this.flag.banTouch = 1

        //得到上一行数据索引
        this.selectedRowIndex = this.selectedRowIndex + 1

        //请求数据 改变exceedingData
        // this.setinfo(this.selectedRowIndex);

        // 得到上一行的数据
        this.tableCurrentRowData = this.displayData[this.selectedRowIndex]
        this.loading.preButton = true

        historyApi.queryHistoryData({
          siteName:this.tableCurrentRowData.name,
          beginTime:this.tableCurrentRowData.beginTime,
          endTime:this.tableCurrentRowData.endTime
        }).then(response => {
          // 保存返回的超标数据
          this.dialog.historyData = response.data.data
          this.dialog.exceptionTotal = response.data.data.length
          // 逻辑处理

          if (this.tableCurrentRowData.exceptionType != '8') {
            this.timeAndDataProcessed()
          } else {
            this.loading.lineChart = true
            this.validProcess()
            this.loading.lineChart = false
            this.flag.banTouch = 0
          }
          this.loading.preButton = false
        })
        
        // let params = index.requestGetParms(
        //   this.tableCurrentRowData.name,
        //   this.tableCurrentRowData.beginTime,
        //   this.tableCurrentRowData.endTime
        // )
        // this.$http.get('/dust/history', { params: params }).then((response) => {
        //   // 保存返回的超标数据
        //   this.dialog.historyData = response.data.data
        //   this.dialog.exceptionTotal = response.data.data.length
        //   // 逻辑处理
        //   this.timeAndDataProcessed()
        //   this.loading.preButton = false
        // })
      }
    },
    /**
     * description：获取下一条异常信息
     */
    getNextRowData() {
      // 不是表格的第一行
      if (this.selectedRowIndex !== 0) {
        // 点击过程中 锁住上下条按钮  在设置完图形配置项后解锁
        this.flag.banTouch = 1

        //得到上一行数据索引
        this.selectedRowIndex = this.selectedRowIndex - 1
        //请求数据 改变exceedingData

        // 得到上一行的数据
        this.tableCurrentRowData = this.displayData[this.selectedRowIndex]
        this.loading.afterButton = true

        historyApi.queryHistoryData({
          siteName:this.tableCurrentRowData.name,
          beginTime:this.tableCurrentRowData.beginTime,
          endTime:this.tableCurrentRowData.endTime
        }).then(response => {
          // 保存返回的超标数据
          this.dialog.historyData = response.data.data
          this.dialog.exceptionTotal = response.data.data.length
          // 逻辑处理

          if (this.tableCurrentRowData.exceptionType != '8') {
            this.timeAndDataProcessed()
          } else {
            this.loading.lineChart = true
            this.validProcess()
            this.loading.lineChart = false
            this.flag.banTouch = 0
          }
          this.loading.afterButton = false
        })


        // let params = index.requestGetParms(
        //   this.tableCurrentRowData.name,
        //   this.tableCurrentRowData.beginTime,
        //   this.tableCurrentRowData.endTime
        // )
        
        // this.$http.get('/dust/history', { params: params }).then((response) => {
        //   // 保存返回的超标数据
        //   this.dialog.historyData = response.data.data
        //   this.dialog.exceptionTotal = response.data.data.length
        //   // 逻辑处理
        //   this.timeAndDataProcessed()
        //   this.loading.afterButton = false
        // })
      }
    },

    /**
     * description：显示对话框,返回该异常时间段的所有数据
     * @param：点击‘查看详情’的该行所有字段数据
     * @createTime:2023-08-18
     */
    showDialog(row) {
      // 打开对话框
      this.dialogTableVisible = true

      // 保存当前行数据
      this.tableCurrentRowData = row

      // 获取当前行的索引
      this.selectedRowIndex = this.displayData.indexOf(row)

      //根据当前行的编号，起始时间来 请求异常数据
      // 对请求到的数据进行首尾拼接
      // 得到前后完整数据进行绘制图形

      historyApi.queryHistoryData({
          siteName:row.name,
          beginTime:row.beginTime,
          endTime:row.endTime
        }).then(response => {
          // 保存返回的超标数据
          this.dialog.historyData = response.data.data
          this.dialog.exceptionTotal = response.data.data.length
          // 逻辑处理

          if (this.tableCurrentRowData.exceptionType != '8') {
            this.timeAndDataProcessed()
          } else {
            this.loading.lineChart = true
            this.validProcess()
            this.loading.lineChart = false
            this.flag.banTouch = 0
          }
        })

      // let params = {}
      // if (row.name) {
      //   params['siteName'] = row.name
      // }
      // if (row.beginTime) {
      //   params['beginTime'] = row.beginTime
      // }
      // if (row.endTime) {
      //   params['endTime'] = row.endTime
      // }

      // this.$http.get('/dust/history', { params: params }).then((response) => {
      //   // 保存返回的超标数据
      //   this.dialog.historyData = response.data.data
      //   this.dialog.exceptionTotal = response.data.data.length
      //   // 逻辑处理
      //   this.timeAndDataProcessed()
      // })
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
      this.flag.originClick = 0
      
      let params = {}
      params['page'] = this.currentPage
      params['pageSize'] = this.pageSize
      
      if (this.form.name) {
        params['siteName'] = this.form.name
      }
      if (this.form.exceptionName.length != 0) {
        params['exceptionType'] = this.form.exceptionName.join()
      }
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime
      this.loading.tableLoading = true
      this.loading.queryButton = true

      console.log('站点：',params['siteName']);
      console.log('类型',params['exceptionType']);
      this.$http.get('/dust/exceptiondata', { params: params }).then((response) => {
        // 保存返回的
        // this.tableData = response.data.data.rows;
        this.displayData = response.data.data.rows
        this.loading.queryButton = false

        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isNoData = true
          return
        }
        this.total = response.data.data.total
        this.loading.tableLoading = false
        // 移除空数据状态
        this.isNoData = false
      })
      this.gethasCheckedNumByTime()
    },

    /**
     * description：打开页面默认加载最近一周的异常数据
     * @createTime:2023-08-18
     */
    backExceptionDataAWeekAgo() {
      this.loading.tableLoading = true
      let params = {}
      if (this.form.name) {
        params['siteName'] = this.form.name
      }


      if (this.form.exceptionName) {
        params['exceptionType'] = this.form.exceptionName
      }
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime

      this.$http.get('/dust/exceptiondata', { params: params }).then((response) => {
        // 保存返回的
        // this.tableData = response.data.data.rows;
        this.displayData = response.data.data.rows

        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.loading.tableLoading = false
          this.isNoData = true
          return
        }
        this.loading.tableLoading = false
        this.total = response.data.data.total
      })
      this.gethasCheckedNumByTime()
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
      const h4 = this.$refs.h4.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px - ${h2}px  - ${h4}px - 20px - 10px - var(--el-main-padding) * 2)`
      // this.tableHeight = `calc(100vh - ${h1}px  - ${h4}px - 100px - var(--el-main-padding) * 2)`;
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
    },
    // 表格序号递增
    indexMethod2(index) {
      return index + 1
    }
  }
}
</script>

<template>
  <el-row ref="h1">
    <el-col>
      <el-card>
        <el-form :inline="true">
          <div class="head-container-text">
            <el-form-item>
              <AreaAndmonitorType :isHideArea="1"></AreaAndmonitorType>
            </el-form-item>

            <el-form-item>
              <InputSearch isNeedDefaultSite="0" isNeedRealTimeAdvice="1" :exceptionType="form.exceptionName" :beginTime="beginTime" :endTime="endTime" @submit-value="(n) => (form.name = n)">
              </InputSearch>
            </el-form-item>

            <el-form-item>
              <DaySelect
                @submit-time="giveDay"
                :day-begin="beginTime"
              ></DaySelect>
            </el-form-item>

            <el-form-item>
              <TimeShortCuts
                @submit-time="giveTime"
                timeType="day"
                :begin-and-end-time="[beginTime,endTime]"
              ></TimeShortCuts>
            </el-form-item>

            <el-form-item>
             
              <ButtonClick
                content="搜索"
                type="warning"
                :loading="loading.queryButton"
                @do-search="handleSubmit"
              ></ButtonClick>
            </el-form-item>
            <el-form-item>
              <ExceptionType @submit-value="(n) => (form.exceptionName = n)"></ExceptionType>
            </el-form-item>
          </div>

          <div class="head-container-search">
            <span class="head-describtion-text">
              金山区 {{ beginTime }} —— {{ endTime }} 扬尘监测异常信息汇总</span
            >
          </div>
        </el-form>
      </el-card>
    </el-col>
  </el-row>

  <el-row ref="h2">
    <el-col>
      <div class="checknum">
        <div class="checknum-text">
          <el-tag>应审核数</el-tag><span >{{ total }} ({{ checkedRate }}%)</span>
        </div>

        <div class="checknum-text">
          <el-tag type="success">已审核数</el-tag><span>{{ auditTotal }}</span>
        </div>
        <div class="checknum-text">
          <el-tag type="info">规范审核数</el-tag><span>{{ auditedRegular }} </span>
        </div>
        <div class="checknum-text">
          <el-tag type="warning">部分审核数</el-tag><span>{{ auditPart }}</span>
        </div>
        <div class="checknum-text">
          <el-tag type="danger">待审核数</el-tag><span>{{ unCheckedNUm }} </span>
        </div>
      </div>
    </el-col>
  </el-row>

  <el-row>
    <el-col v-show="!isNoData">
      <el-table
        ref="table"
        :data="displayData"
        :height="tableHeight"
        :highlight-current-row="true"
        :row-class-name="tableRowClassName"
        size="default"
        v-loading="loading.tableLoading"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" align="center" />
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
        <el-table-column prop="typename" label="场景" align="center" width="82" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" align="center" show-overflow-tooltip />
        <el-table-column prop="dutyCompany" label="运维商" align="center" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" @click="showDialog(row)"> 查看详情 </el-button>
            <el-button
              v-if="row.auditStatus == 3"
              size="default"
              type="info"
              @click="openAuditDiag(row)"
              >已审核</el-button
            >
            <el-button
              type="success"
              size="default"
              plain
              v-else-if="row.auditStatus == 1 || row.auditStatus == 2"
              @click="openAuditDiag(row)"
              >待审核</el-button
            >

            <el-button v-else size="default" type="danger" @click="openAuditDiag(row)"
              >待审核</el-button
            >
            <!-- <span v-if="row.auditStatus == 3">已审核</span
              ><span v-else>审核</span> -->
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-row ref="h2">
    <el-row> -->
      <div class="check-button">
        <el-button
          type="primary"
          size="small"
          :disabled="multipleSelection.length == 0"
          @click="quickReview"
          >批量审核</el-button
        >
        <el-button
          type="primary"
          size="small"
          :disabled="multipleSelection.length == 0"
          @click="clearSelected"
          >清除选中</el-button
        >
      </div>
      <!-- </el-row>
  </el-row> -->

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

  <el-empty v-show="isNoData" :image-size="200" />

  <el-dialog v-model="auditDialog.visible" :show-close="false" draggable>
    <template #header>
      <!-- <div class="title-text">添加备注</div> -->
      <span class="title-text">{{ tableCurrentRowData.name }}</span
      ><span>站点异常数据审核</span>
    </template>

    <el-form label-position="top">
      <el-form-item label="审核人">
        <el-input v-model="userName.getUserName"></el-input>
      </el-form-item>
      <el-form-item label="审核情况">
        <el-input
          v-model="auditDialog.checkerNotes"
          type="textarea"
          :autosize="true"
          placeholder="审核人员填写"
          :disabled="tableCurrentRowData.auditStatus == 1"
        />
      </el-form-item>
      <el-form-item label="企业反馈">
        <el-input
          v-model="auditDialog.enterpriseNotes"
          type="textarea"
          :autosize="true"
          placeholder="企业填写"
          :disabled="tableCurrentRowData.auditStatus == 2"
        />
      </el-form-item>
    </el-form>

    <el-card v-show="tableCurrentRowData.auditStatus == 3">
      <template #header>审核详情</template>
      <el-form>
        <el-form-item label="审核人">{{ tableCurrentRowData.checker }}</el-form-item>
        <el-form-item label="审核情况">{{ tableCurrentRowData.checkerContent }}</el-form-item>
        <el-form-item label="审核人员">{{ tableCurrentRowData.enterpriseContent }}</el-form-item>
      </el-form>
    </el-card>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button color="#626aef" :dark="isDark" plain @click="saveAudit">保存</el-button>
        <el-button
          type="primary"
          :loading="loading.submitAudit"
          :disabled="tableCurrentRowData.auditStatus == 3"
          @click="submitAudit"
        >
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
    claa="exception-dialog"
    v-model="dialogTableVisible"
    draggable
    align-center
    width="700px"
  >
    <!-- 头 -->
    <template #header>
      <div class="diag-head">
        <div class="diag-head-text">
          <div><span class="diag-head-text1">点位名称：</span>{{ tableCurrentRowData.name }}</div>
          <div><span class="diag-head-text1">设备编号：</span>{{ tableCurrentRowData.mnCode }}</div>
          <div><span class="diag-head-text1">运维商：</span>{{ tableCurrentRowData.dutyCompany }}</div>
 

          <div>
            <span class="diag-head-text1">异常时间段：</span>{{ tableCurrentRowData.beginTime }} ~
            {{ tableCurrentRowData.endTime }}
          </div>
        </div>

        <div class="chart-jump-button">
          <el-button
            type="danger"
            :loading="loading.preButton"
            :disabled="dialog.isPreCantouch || flag.banTouch"
            @click="getNextRowData"
            >上条异常</el-button
          >
          <el-button
            type="danger"
            :loading="loading.afterButton"
            :disabled="dialog.isNextCantouch || flag.banTouch"
            @click="getPreviousRowData"
            >下条异常</el-button
          >
        </div>
      </div>
    </template>

    <!-- 图形 -->
    <DustLineChart
      :option="dialog.option"
      :is-open-dialog="dialogTableVisible"
      v-loading="loading.lineChart"
    >
    </DustLineChart>

    <!-- 表格 -->
    <div>
      <el-table :data="dialog.historyData" size="default" height="200" border>
        <el-table-column
          type="index"
          label="序号"
          width="60px"
          align="center"
          fixed
          :index="indexMethod2"
        ></el-table-column>
        
        <el-table-column prop="lst" label="采集时间" align="center" show-overflow-tooltip />
        <el-table-column
          prop="dustValue"
          label="TSP(mg/m³)"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="flag" label="数据标识" align="center" show-overflow-tooltip />
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-tag type="success" class="mx-1" effect="dark" round
          ><span class="table-line-lable" v-show="tableCurrentRowData.exceptionType == '0'"
            >缺失数据：
          </span>
          <span
            v-show="
              tableCurrentRowData.exceptionType == '1' ||
              tableCurrentRowData.exceptionType == '2' ||
              tableCurrentRowData.exceptionType == '3' ||
              tableCurrentRowData.exceptionType == '4' ||
              tableCurrentRowData.exceptionType == '5' ||
              tableCurrentRowData.exceptionType == '6' ||
              tableCurrentRowData.exceptionType == '7' ||
              tableCurrentRowData.exceptionType == '8'
            "
            >异常数据：</span
          >
          <span class="table-line-num">{{ dialog.exceptionTotal }}条</span>
          <span v-show="tableCurrentRowData.exceptionType == '0'"> (逻辑计算)</span>
        </el-tag>
        <el-text v-show="tableCurrentRowData.exceptionType == '8'" type="warning" class="dialog-footer-text">数据标识A为数据长期缺失,系统自动补全</el-text>
        <!-- <el-text class="mx-1" type="warning">Warning</el-text> -->
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-row {
  margin-left: 20px;
}
/* 条件查询模块的样式 */
.el-card {
  margin-top: 10px;
  margin-right: 10px;
}
.head-container-search {
  display: flex;
  justify-content: space-between;
  
}
.head-describtion-text {
  justify-content: flex-end;
  margin-bottom: 10px;
  font-size: 14px;
  color: gray;
}
/* 条件查询模块结束 */

/*分析 */
.checknum {
  margin: 10px 5px 20px 20px;
  display: flex;
}
.checknum-text {
  font-size: 14px;
  margin-right: 50px;
}
.el-tag {
  font-size: 14px;
  vertical-align: baseline;
}

.checknum-rate {
  margin-left: 5px;
}

/* 分析结束 */

/* 表格模块的样式 */
:global(.el-table .black-row) {
  color: black;
}

:global(.el-table .complete--gray-row) {
  color: #86909c;
}
:global(.el-table .deep-gray-row) {
  color: #7f9fcf;
}
/* 对话框标题 */
.el-form-item__labe {
  font-weight: bold;
}
.title-text {
  font-weight: bold;
  margin-right: 20px;
}
.check-button {
  float: right;
  margin-top: 10px;
  margin-right: 20px;
}
.el-table {
  color: #333333;
}
/* 表格模块结束 */

/* 查看详情对话框模块的样式 */


.diag-head-text1 {
  /* 对话框头部的属性字段加粗 */
  font-weight: bold;
}

.diag-head-text > div {
  /* 对话框异常时间段 */
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

.line-chart {
  /*  异常折线图 */
  width: 920px;
  height: 300px;
  margin-bottom: 20px;
  min-width: 600px;
}

.mx-1 {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
.dialog-footer{
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
