import dayjs from 'dayjs'
// import exceptionApi from '../../api/exceptionApi';
export default {
  /**
   * 计算日期相差几天
   * @param：
   * @createTime:开始时间，结束时间
   * @returns：
   */
  getDaysDifference(startDate, endDate) {
    return dayjs(endDate).diff(startDate, 'day') + 1
  },

  /**
   * 从分析数据数组中计算最小和大值 ,平均值，    在线率，有效率，超标率（后三个值为0~100取值）
   * @param：分析表中的数据
   * @returns：
   */
  calBillData(arr, beginTime, endTime) {
    let min = 65536
    let max = -1
    let avg = 0
    let online = 0
    let valid = 0
    let exceeding = 0

    let sumAvg = 0
    let sumOnline = 0
    let sumValid = 0
    let sumExceeding = 0

    // 计算选择的时间的相差的天数
    let begin = dayjs(beginTime).format('YYYY-MM-DD')
    let end = dayjs(endTime).format('YYYY-MM-DD')
    let dayDiff = this.getDaysDifference(begin, end)
    let obj = {}
    // 计算最小和大值
    arr.forEach((item) => {
      if (item.min < min) {
        min = item.min
      }
      if (item.max > max) {
        max = item.max
      }
      // 计算平均值，在线率，有效率，超标率
      sumAvg = sumAvg + item.dayAvg

      sumOnline = sumOnline + Number(item.dayOnline)
      sumValid = sumValid + Number(item.dayValid)
      sumExceeding = sumExceeding + Number(item.dayExceeding)
    })
    // 计算均值
    avg = sumAvg / dayDiff
    online = sumOnline / dayDiff
    valid = sumValid / dayDiff
    exceeding = sumExceeding / dayDiff
    obj['min'] = min.toFixed(3)
    obj['max'] = max.toFixed(3)

    obj['avg'] = avg.toFixed(2)
    obj['online'] = online.toFixed(2)
    obj['valid'] = valid.toFixed(2)
    obj['exceeding'] = exceeding.toFixed(2)

    return obj
  },

  /**
   * 计算异常类型聚集度：该时段出现的异常类型数量除8
   *  异常复现率: 量级突变,超标临近和超标次数临界在该时段出现的累计复现此次除3（比如量级突变出现3次，算作复现2次）
   * @param： 异常数据数组
   * @returns：
   */
  calRecur(exceptionArr) {
    if (exceptionArr.length == 0) {
      let obj = {}
      obj['exceptionRecurrence'] = 0
      obj['exceptionTypeAggregation'] = 0

      return obj
    }

    // 量级突变
    let mutationCount = 0
    // 超标临近
    let exceedingNearCount = 0
    // 超标次数临界
    let exceedingCriticalDegree = 0

    // 保存出现的不同异常类型
    let exception = []
    // 异常类型聚集度
    let exceptionTypeAggregation = 0
    // 典型异常复现率
    let exceptionTyprRecurRate = 0
    // 记录指定3种异常出现的次数和不同的异常种类
    exceptionArr.forEach((item) => {
      // 量级突变异常
      if (item.exceptionType == 4) {
        mutationCount++
        // 临近超标异常
      } else if (item.exceptionType == 5) {
        exceedingNearCount++
        // 单日超标次数临界异常
      } else if (item.exceptionType == 6) {
        exceedingCriticalDegree++
      }

      // 异常类型聚集度
      if (exception.length == 0) {
        exception.push(item.exceptionType)
      }
      // 保存新的异常类型 数据超低、长时间无波动等两类异常暂不纳入分析
      else if ( item.exceptionType!='1' && item.exceptionType!='3' && exception.indexOf(item.exceptionType) == -1) {
        exception.push(item.exceptionType)
      }
    })

    let sum = 0
    // 次数减1，该异常出现2次，算复现1次。出现3次，算复现2次...
    if (mutationCount > 1) {
      sum = sum + mutationCount - 1
    }
    if (exceedingNearCount > 1) {
      sum = sum + exceedingNearCount - 1
    }
    if (exceedingCriticalDegree > 1) {
      sum = sum + exceedingCriticalDegree - 1
    }

    switch (true) {
      case sum == 0 || sum == 1:
        exceptionTyprRecurRate = (sum / 3).toFixed(2)
        break
      case sum == 2 || sum >= 3:
        exceptionTyprRecurRate = 1
        break
      default:
        return 'error'
    }
    
    // 数据超低、长时间无波动等两类异常暂不纳入分析
    exceptionTypeAggregation = (exception.length / 6).toFixed(2)

    let obj = {}
    obj['exceptionRecurrence'] = exceptionTyprRecurRate
    obj['exceptionTypeAggregation'] = exceptionTypeAggregation


    if(exception.length>0){
      // 保存该时段出现的异常
      obj['exception'] = exception.length
    }else{
      obj['exception'] = 0
    }
    

    // 三类异常出现的次数
    obj['mutationCount'] = mutationCount
    obj['exceedingNearCount'] = exceedingNearCount
    obj['exceedingCriticalDegree'] = exceedingCriticalDegree


    return obj
  },


  // 参数：对象数组(该对象中的属性不能是引用类型，否则拷贝的值还是会相互影响)
  // 功能：拷贝该对象数组。
  shallowCopyList(val) {
    if (val == 'arr') {
      let tempList = []
      return tempList
    } else if (val == 'obj') {
      let tempList = {}
      return tempList
    }
  },
  getRate(obj) {
    let a = {}
    a.online = obj['dayOnline']
    a.valid = obj['dayValid']
    a.exceeding = obj['dayExceeding']
    return a
  },

  /**
   * 找到对象数组中属性mnCode为value的对象 添加进数组中
   * @param： 对象数组 ，mnCode等于value
   * @returns：
   */
  findValue(exceptionData, value) {
    if (exceptionData.length == 0) {
      return []
    }

    let temp = []
    exceptionData.forEach((res) => {
      if (res.mnCode == value) {
        temp.push(res)
      }
    })
    return temp
  },

  /**
   * 计算风险值
   * @param： 数组。依次是在线率，有效率，超标率，异常类型聚集度，异常复现率
   * @returns：
   */
  calRiskValue(arr) {
    // 用100减 是因为该属性需要计算的是风险值，应当是离线率，无效率
    // 乘以0.01是因为去除百分号后需要再缩小100倍
    /* arr[0]:在线率 90%
     arr[1]:有效率 100%
     arr[2]:超标率 2%
     arr[3]:典型异常复现风险 0.2
     arr[4]:异常类型聚集风险  0.5
  */
    let weight = (
      (100 - parseFloat(arr[0].slice(0, -1))) * 0.01 * 0.1 +
      (100 - parseFloat(arr[1].slice(0, -1))) * 0.01 * 0.2 +
      parseFloat(arr[2].slice(0, -1)) * 0.01 * 0.2 +
      arr[3] * 0.2 +
      arr[4] * 0.3
    ).toFixed(2)

    return weight
  },

  /**
   * 对分析值和异常值计算风险值
   * @param： 分析数据，异常数据，开始时间，结束时间
   * @returns：表格数据
   */
  merge(anaData, exceptionData, beginTime, endTime) {
    if (anaData.length == 0) {
      return []
    }
    const table = []
    let i = 0
    anaData.forEach((res) => {
      // 从分析数据中得到设备编号
      let mnCode = res.mnCode
      // 找到异常数据中mnCode等于value的对象
      let d = this.findValue(exceptionData, mnCode)
      // let temp = [...res,...d]

      // 计算在线，有效率，超标率
      let r1 = this.getRate(res, beginTime, endTime)

      // 计算复现率
      let r2 = this.calRecur(d)
      i = i + 1
      // 数组的拷贝 防止地址引用
      let temp = this.shallowCopyList('arr')
      temp.push(r1['online'])
      temp.push(r1['valid'])
      temp.push(r1['exceeding'])
      temp.push(r2['exceptionRecurrence'])
      temp.push(r2['exceptionTypeAggregation'])
      // 计算风险值
      let weight = this.calRiskValue(temp)

      // 对象的拷贝 防止地址引用
      let obj = this.shallowCopyList('obj')

      // 构成表格的一行
      obj.region = '金山区'
      obj.monitorType = '扬尘'
      obj.siteName = res.name
      obj.mnCode = res.mnCode
      obj.beginTime = beginTime
      obj.endTime = endTime
      obj.riskValue = weight
      if (weight >= 0.6) {
        obj.riskGrage = '高风险'
        obj.riskAdvice = '1.若不涉及超标或在线率、有效率异常，常态数据审核即可；\n2.若涉及超标或在线率、有效率等异常，建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，及时开展自查自纠；'
      } else if (weight < 0.6 && weight >= 0.2) {
        obj.riskGrage = '中风险'
        obj.riskAdvice = '1.建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，聚焦当前存在的问题或隐患，及时开展自查自纠；\n2.若同时存在在线率或有效率月度不达标，建议电话通知该站点所属单位进行应急维护，并进行专项审核；'
      } else {
        obj.riskGrage = '低风险'
        obj.riskAdvice = '1.建议及时提醒该站点所属单位进行应急维护；\n2.若同时存在超标、临界超标、量级突变等异常时，建议将该站点移交环境执法大队开展现场执法检查；\n3.若持续两月及以上为高风险，建议将该站点纳入年度抽测比对清单；'
      }
      table.push(obj)
    })

    return table
  }
}
