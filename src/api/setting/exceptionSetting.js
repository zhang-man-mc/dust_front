import { $http } from '@/api/index.js'

export default {
  /**
   * 提交 数据获取的配置参数修改
   * @param： 配置表对应的字段对象
   * @returns：
   */
  submitExceptionSetting(params) {
    return $http.post('/dust/exception/addSetting', params)
  },

  /**
   * 查询异常数据配置
   * @param：
   * @returns：
   */
  queryExceptionSetting() {
    return $http.get('/dust/exception/querySetting')
  },

  /**
   * 提交 数据获取的配置参数修改
   * @param： 配置表对应的字段对象
   * @returns：
   */
  alertExceptionSetting(params) {
    return $http.post('/dust/exception/alertSetting', params)
  },

  /**
   * 查询数据请求的默认配置 1.0版本
   * @param：
   * @returns：
   */
  queryDefaultSetting() {
    return $http.get('/dust/exception/byVersion', { params: { version: '1.0' } })
  }
}
