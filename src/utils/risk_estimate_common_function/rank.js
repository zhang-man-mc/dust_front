// import dayjs from 'dayjs';
import exceptionApi from '@/api/exceptionApi.js'
import index from '@/utils/risk_estimate_common_function/index.js'

export default {
  // 根据设备编号进行分组
  groupByMncode(analysisData) {
    const groupedData = {}
    for (let obj of analysisData) {
      const mnCode = obj.mnCode
      if (!groupedData[mnCode]) {
        groupedData[mnCode] = []
      }
      groupedData[mnCode].push(obj)
    }
    return groupedData
  },

  fetchData(beginTime, endTime) {
    return new Promise((resolve, reject) => {
      // 获取统计分析数据
      exceptionApi.analysisdataByTimeAndType(beginTime, endTime, 'day').then((response) => {
        const chartData = response.data.data
        console.log('fenxi:', chartData)
        // 获取异常数据
        exceptionApi
          .exceptiondata1({
            siteName: '',
            beginTime: beginTime,
            endTime: endTime
          })
          .then((res) => {
            let result = this.merge(chartData, res.data.data, beginTime, endTime)
            console.log('名字为：', result.siteName, result.max)
            resolve(result.siteName)
            // return result.siteName
          })
      })
    })
  },

  // 企业异常详情
  exceptiondataCount(beginTime, endTime, type) {
    exceptionApi.analysisdataByTimeAndType(beginTime, endTime, type).then((res) => {
      let obj = index.calRecur(res.data.data)
      this.bill.exceptionRecurrence = obj['exceptionRecurrence']
      this.bill.exceptionTypeAggregation = obj['exceptionTypeAggregation']
    })
  },

  merge(anaData, exceptionData, beginTime, endTime) {
    if (anaData.length == 0) {
      return []
    }
    let i = 0
    // 对设备编号进行分组
    let groupeObj = this.groupByMncode(anaData)
    // 保存风险值和站点名字
    let weightAndName = []
    for (let item in groupeObj) {
      // item是设备编号， 获得item对应得数据
      let groupBySameMncode = groupeObj[item]

      // 从分析数据中得到设备编号
      let mnCode = item
      // 找到异常数据中mnCode等于value的对象
      let d = index.findValue(exceptionData, mnCode)
      // let temp = [...res,...d]

      // 计算在线，有效率，超标率
      // 有问题
      let r1 = index.calBillData(groupBySameMncode, beginTime, endTime)

      // 计算复现率
      let r2 = index.calRecur(d)
      i = i + 1
      // 数组的拷贝 防止地址引用
      let temp = index.shallowCopyList('arr')
      temp.push(r1['online'])
      temp.push(r1['valid'])
      temp.push(r1['exceeding'])
      temp.push(r2['exceptionRecurrence'])
      temp.push(r2['exceptionTypeAggregation'])
      // 计算风险值
      let weight = index.calRiskValue(temp)

      // 对象的拷贝 防止地址引用
      let obj = index.shallowCopyList('obj')
      obj.riskValue = weight
      // 添加该设备编号对应得站点名字
      obj.name = groupBySameMncode[0].name
      weightAndName.push(obj)
    }

    // 获得最大风险值得名字
    const result1 = this.compare_riskWeight(weightAndName)
    return result1
  },

  compare_riskWeight(arr) {
    const obj = {
      max: -1,
      siteName: ''
    }

    arr.forEach((item) => {
      if (item.riskValue > obj.max) {
        obj.max = item.riskValue
        obj.siteName = item.name
      }
    })
    return obj
  }
}
