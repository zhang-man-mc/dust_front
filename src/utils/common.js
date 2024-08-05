import * as XLSX from 'xlsx/xlsx.mjs'
import dayjs from 'dayjs'

export function useCommonFunction() {
  /**
   * description：判断起始时间跨度是否超过1个月
   * @param： 开始时间，结束时间
   * @createTime:2023-08-18
   * @returns：超过一个月返回true,不超过一个月则返回false
   */

  function isExceedOneMonth(dateStr1, dateStr2) {
    // 超过一个月，返回True，否则返回False
    // 将日期字符串转为日期对象
    const date1 = new Date(dateStr1)
    const date2 = new Date(dateStr2)

    // 获取两个日期的年、月、日
    const year1 = date1.getFullYear()
    const month1 = date1.getMonth()
    const day1 = date1.getDate()

    const year2 = date2.getFullYear()
    const month2 = date2.getMonth()
    const day2 = date2.getDate()

    // 判断两个日期是否相差一个月
    if (year1 === year2) {
      // 年份相等，比较月份差值
      if (Math.abs(month1 - month2) === 1) {
        // 月份差值为1，还需要判断具体日期
        if ((month1 < month2 && day1 < day2) || (month1 > month2 && day1 > day2)) {
          return true
        }
      }
    } else if (Math.abs(year1 - year2) === 1) {
      // 年份差值为1，比较月份和日期
      if (
        (year1 < year2 && month1 === 11 && month2 === 0 && day1 < day2) ||
        (year1 > year2 && month1 === 0 && month2 === 11 && day1 > day2)
      ) {
        return true
      }
    }

    // 默认返回false，表示两个日期字符串不相差一个月
    return false
  }

  /**
   * 百分号比较大小
   * @param： a是否大于b
   * @returns：大于，则返回true。否则返回false
   */
  function cmpp(a, b) {
    return Number(a.replace('%', '')) >= Number(b.replace('%', ''))
  }

  /**
   *导出为excel
   * @param： 表格数据，待导出的表格列，excel列，excel文件名
   * @returns
   */
  function exportToExcel(exportData, tableColumns, excelColumnsName, excelName = 'data.xlsx') {
    const itemsFormatted = exportData.map((item) => {
      const newItem = {}
      tableColumns.forEach((col) => {
        newItem[col] = item[col]
      })
      return newItem
    })
    // 创建xlsx对象
    const xls = XLSX.utils.json_to_sheet(itemsFormatted)

    // 编辑表头行       修改表头
    excelColumnsName.forEach((item) => {
      xls[item[0]].v = item[1]
    })
    // 创建workbook，并把sheet添加进去
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, xls, 'Sheet1')
    // 将workbook转为二进制xlsx文件并下载
    XLSX.writeFile(wb, excelName)
  }

  /**
   * description：返回时间数组，间隔15分钟。
   * @param： 异常的开始,异常结束时间
   * @createTime:2023-08-17
   * @returns：比如12:00:00-13:00:00 所以返回的数组元素是 12:00:00 ,12:15:00,12:30:00,12:45:00，13:00:00
   */
  function descFiftyTime(begin, end) {
    let time = []
    if (begin == end) {
      time.push(begin)
      return time
    }
    time.push(begin)
    let temp = dayjs(begin).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss')
    while (temp != end) {
      time.push(temp)
      temp = dayjs(temp).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss')
    }
    // 加上异常的结束时间
    time.push(temp)
    return time
  }

  /**
   * 格式化为百分号
   * @param {*} v 
   * @returns 
   */
  function percentFormatter(v) {
    return Math.round(v * 100, 2) + '%'
  }

   /**
     * 找出字符串数字的最大值
     * @param： 
     * @returns：
     */
   function findMaxValue(values) {
    const numbers = values.map((value) => parseFloat(value))
    const max = Math.max(...numbers)
    return max.toString()
  }
  
  return { isExceedOneMonth, cmpp, exportToExcel, descFiftyTime, percentFormatter,findMaxValue }
}
