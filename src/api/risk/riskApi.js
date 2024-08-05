import { $http } from '@/api/index.js'

export default {
  /**
   * 根据站点信或月份，类型 查询风险值
   * @param：
   * @returns：
   */

  queryRiskValue(mnCode, month, type) {
    const params = {
      mnCode: mnCode,
      month: month,
      type: type
    }

    return $http.get('/dust/risk/month', { params: params })
  },

  /**
   * 根据风险值获得风险等级和风险建议
   * @param： 
   * @returns：
   */
  getRiskAdvice(riskValue) {
    let temp = {}
    // 低风险
    if (riskValue < 0.2) {
      temp.riskGrade = '低风险'
      temp.riskAdvice =
        '1.建议及时提醒该站点所属单位进行应急维护；\n2.若同时存在超标、临界超标、量级突变等异常时，建议将该站点移交环境执法大队开展现场执法检查；\n3.若持续两月及以上为高风险，建议将该站点纳入年度抽测比对清单；'.split('\n')
      
    }
    // 中风险
    if (riskValue < 0.6 && riskValue >= 0.2) {
      temp.riskGrade = '中风险'
      temp.riskAdvice =
        '1.建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，聚焦当前存在的问题或隐患，及时开展自查自纠；\n2.若同时存在在线率或有效率月度不达标，建议电话通知该站点所属单位进行应急维护，并进行专项审核；'.split('\n')
    }
    // 高风险
    if (riskValue >= 0.6) {
      temp.riskGrade = '高风险'
      temp.riskAdvice =
        '1.若不涉及超标或在线率、有效率异常，常态数据审核即可；\n2.若涉及超标或在线率、有效率等异常，建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，及时开展自查自纠；'.split('\n')
    }
    return temp
  }
}
