/* 时间函数 */

import lineChart from '@/utils/chartFunction/lineChart.js'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayjs from 'dayjs'
dayjs.extend(customParseFormat)
export default {
  // 判断已选的月份是否大于当前月份
  judgeDateValid(date) {
    // 获得当月月份
    let currentMonth = dayjs()
    let selectMonth = date.getTime()
    // 选择大于现在月份
    if (selectMonth > currentMonth) {
      return true
    }

    return false
  },

  /**
   * 判断两个日期是否相差指定的分钟数
   * @param：
   * @returns：
   */
  isTimeOverFifty(time1, time2, minutes = 15) {
    let t1 = dayjs(time1)
    let t2 = dayjs(time2)

    let timeDifferce = Math.abs(t1.diff(t2, 'minute'))
    if (timeDifferce <= minutes) {
      return false
    }
    return true
  },

  /**
   * 根据指定的分钟间隔，划分起始时间
   * @param：开始时间 结束时间 间隔分钟数
   * @returns：
   */
  ascTime(beginTime, endTime, intervalMinute = 15) {
    if (beginTime >= endTime) {
      return []
    }

    let time = []
    time.push(beginTime)
    let bt = dayjs(beginTime).add(intervalMinute, 'minute')
    let et = dayjs(endTime)

    while (bt < et) {
      time.push(bt.format('YYYY-MM-DD HH:mm:ss'))
      bt = dayjs(bt).add(intervalMinute, 'minute')
    }
    return time
  },

  /**
   * 返回flag不等于N的时间点和数据缺失的时间点
   * @param：扬尘数据，升序的时间字符串数组(接口中返回的已经是升序)
   * @returns：升序的时间点
   */
  invalidTime(dustData, timeArr) {
    // 参数为空则退出
    if (!dustData.length || !timeArr.length) {
      return []
    }

    let time = []
    timeArr.forEach((item) => {
      let r = lineChart.findDate(dustData, item)
      // 没有找到对应时间的数据
      if (r == false) {
        // 将该时间加入数组
        time.push(item)
      }

      // 找到对应时间的数据，并且该数据标识不等与‘N’
      if (r && r.flag != 'N') {
        // 将该数据的采集时间加入数组
        time.push(r.lst)
      }
    })

    return time
  },
  /**
   * 返回有效的时间点
   * @param：扬尘数据
   * @returns：升序的时间点
   */
  validTime(dustData) {
    // 参数为空则退出
    if (!dustData.length) {
      return []
    }

    let time = []
    dustData.forEach((item) => {
      if (item.flag != 'A') {
        time.push(item.lst)
      }
    })

    return time
  },
  /**
   * 取指定间隔的时间为连续时间，放在数组中。 孤立的时间点与自身算一个连续
   * 目的是构造有效率缺失的颜色背景区间
   * @param：时间字符串数组
   * @returns：[ ['2023-11-02 00:00:00','2023-11-02 00:15:00','2023-11-02 00:30:00']]
   */
  seriesTime(timeArr, intervalMinute = 15) {
    let temp = []
    let temp_1 = []
    for (let i = 0; i < timeArr.length; i++) {
      // 当前时间
      let currentTime = timeArr[i]
      if (i === 0) {
        temp_1.push(currentTime)
        continue
      }
      // 前一个
      let pre = timeArr[i - 1]

      // 超过15分钟
      if (this.isTimeOverFifty(pre, currentTime, intervalMinute)) {
        // 列表为连续时长为自身
        temp.push(temp_1)
        temp_1 = [currentTime]
      }
      // 不超过15分钟
      else {
        temp_1.push(currentTime)
      }
    }

    if (temp_1.length > 0) {
      temp.push(temp_1)
    }

    // 整理数据
    let temp_2 = []
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].length == 1) {
        temp_2.push([temp[i][0], temp[i][0]])
      } else if (temp[i].length > 1) {
        temp_2.push([temp[i][0], temp[i][temp[i].length - 1]])
      }
    }

    return temp_2
  },

  splitTime(timeArr) {
    let result = []
    for (let i = 0; i < timeArr.length; i++) {
      let temp = []
      for (let j = 0; j < timeArr[i].length; j++) {
        temp.push(timeArr[i][j].slice(11, -3))
      }
      result.push(temp)
    }
    return result
  },

  /**
   *判断是否是有意义的日期
   * @param：
   * @returns：
   */
  judgeTimeValid(time) {
    let r1 = dayjs(time, 'YYYY-MM-DD HH:mm:ss', true).isValid()
    let r2 = dayjs(time, 'YYYY-MM-DD', true).isValid()
    // 两种日期格式都无效时
    if (!r1 && !r2) {
      return false
    }
    // 符合任意一种格式
    return true
  },
  /**
   * 'YYYY-MM-DD HH:mm:ss'返回true
   * @param：
   * @returns：
   */
  judgeTimeFormat(time) {
    // 'YYYY-MM-DD HH:mm:ss'
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
    // 'YYYY-MM-DD'
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/

    if (dateTimeRegex.test(time)) {
      return true
    } else if (dateRegex.test(time)) {
      return false
    }
  },

  /**
   * 找到在给定的开始时间bt和结束时间et之间缺失的时间区间
   * @param：开始时间，结束时间，在这个时间范围内已有的时间（时间字符串数组）,数组中时间的间隔
   * @returns：
   */
  getMissingDays(bt, et, timeArr, minutesNum = 1440) {
    // 判断日期是否有意义
    if (!this.judgeTimeValid(bt) || !this.judgeTimeValid(et)) {
      return false
    }
    // 存储缺失的时间区间
    const r = []
    const begin = dayjs(bt)
    const end = dayjs(et)
    // 开始时间
    let current = begin

    for (const time of timeArr) {
      const currentTime = dayjs(time)
      if (currentTime.isBefore(current)) {
        continue
      }

      if (currentTime.isAfter(current)) {
        r.push([current, currentTime])
      }

      current = currentTime.add(minutesNum, 'minute')
    }

    if (end.isAfter(current)) {
      r.push([current, end])
    }

    let f = this.judgeTimeFormat(bt) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
    for (let i = 0; i < r.length; i++) {
      for (let j = 0; j < r[i].length; j++) {
        r[i][j] = r[i][j].format(f)
      }
    }
    return r
  },
  /**
   * 根据时间字符串返回UTC时间
   * @param： 
   * @returns：
   */
  utcTime(timeStr){
    return dayjs(timeStr).format()
  },
  /**
   * 将utc时间转为时间字符串
   * @param： 
   * @returns：
   */
  utcToStr(dateTime){
    const r = dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') :false
    return r
  }
}
