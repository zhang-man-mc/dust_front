import dayjs from 'dayjs'

export default {
  // 获取该月份天数
  // 根据起始时间构建x轴
  // 根据天数遍历
  // 日期天数+1
  // 添加到x轴数组
  // 直到遍历的次数
  // 根据天数遍历
  // 对为空的的天数数据 进行补充 y轴数据为null

  /**
   * 根据传入的统计数据，起始时间，返回完整的x,y轴数据
   * @param： 统计数据，开始时间，结束时间
   * @returns：x,y轴数据
   */
  getLineChartXYData(analysisData, beginTime, endTime) {
    // x轴
    let xData = []
    // y轴的平均值
    let yAvg = []
    //  y轴的在线率
    let yOnline = []
    //  y轴的有效值
    let yValid = []
    //  y轴的超标率
    let yExceed = []
    // 保存x,y轴值
    let obj = {}

    // 开始日期为
    let dateBegin = dayjs(beginTime).subtract(1, 'day').format('YYYY-MM-DD')
    let dateEnd = dayjs(endTime).format('YYYY-MM-DD')

    //  当前的日期为开始日期的前一天
    let currentDate = dateBegin
    // 对无数据的日期进行填充
    while (currentDate < dateEnd) {
      // 当前日期增加1天
      currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD')

      // 根据日期查找对应数据
      let tempData = this.findDate(analysisData, currentDate)
      // 找到对应日期的数据，
      if (tempData) {
        xData.push(tempData.lst)
        yAvg.push(tempData.dayAvg)

        yOnline.push(tempData.dayOnline)
        yValid.push(tempData.dayValid)
        yExceed.push(tempData.dayExceeding)
        continue
      }

      // 未发现该日期的数据
      xData.push(currentDate)
      yAvg.push(null)
      yOnline.push(null)
      yValid.push(null)
      yExceed.push(null)
    }

    obj.xData = xData
    obj.yAvg = yAvg
    obj.yOnline = yOnline
    obj.yValid = yValid
    obj.yExceed = yExceed
    return obj
  },

  /**
   * 获取月天数
   * @param：
   * @returns：
   */
  backMonthDayNums(time) {
    return dayjs(time).daysInMonth()
  },

  /**
   * 组成无数据区域
   * @param： 2维数组
   * @returns：
   */
  getMarkArea(timeInteval, describe = '无数据') {
    let result = []
    for (let i = 0; i < timeInteval.length; i++) {
      let temp = []
      for (let j = 0; j < timeInteval[i].length; j++) {
        let obj = {}
        // 给第一个对象加上name属性
        if (j == 0) {
          obj.name = describe
        }
        obj.xAxis = dayjs(timeInteval[i][j]).format('YYYY-MM-DD')
        temp.push(obj)
      }
      result.push(temp)
    }
    return result
  },

  /**
   * 找到对象数组中属性lstd的值
   * @param： 对象数组 ，mnCode等于value
   * @returns：
   */
  findDate(analysisData, date) {
    if (analysisData.length == 0) {
      return false
    }

    // 查找日期
    for (let i = 0; i < analysisData.length; i++) {
      if (analysisData[i].lst == date) {
        return analysisData[i]
      }
    }

    return false
  },

  /**
   * 去除字符串的百分号
   * @param：
   * @returns：
   */
  deleteLastStr(valueStr) {
    return valueStr.slice(0, -1)
  },

  /**
   * 指定时间区间的线段变颜色
   * @param：
   * @returns：
   */
  getLineColor(timeInteval, xList) {
    let result = []

    // 只取
    let temp = []
    for (let i = 0; i < timeInteval.length; i++) {
      if (timeInteval[i][0] != timeInteval[i][1]) {
        temp.push(timeInteval[i])
      }
    }

    // 无连续的数据 直接退出
    if (temp.length == 0) {
      return []
    }

    // 取第一个连续的时段
    result.push([
      {
        lte: temp[0][0],
        color: 'green'
      },
      {
        gt: temp[0][0],
        lte: temp[0][1],
        color: 'red'
      },
      {
        gt: temp[0][1],
        lte: xList[xList.length - 1],
        color: 'green'
      }
    ])
    return result[0]
  }
}
