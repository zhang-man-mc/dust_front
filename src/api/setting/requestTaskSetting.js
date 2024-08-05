import { $http } from '@/api/index.js'

export default {
  /**
   * 提交 数据获取的配置参数修改
   * @param： 配置表对应的字段对象
   * @returns：
   */
  submitRequestSetting(params) {
    return $http.post('/dust/request/addSetting', params)
  },

  /**
   * 查询数据请求配置
   * @param：
   * @returns：
   */
  queryRequestSetting() {
    return $http.get('/dust/request/querySetting')
  },


  /**
   * 提交 数据获取的配置参数修改
   * @param： 配置表对应的字段对象
   * @returns：
   */
  alertRequestSetting(params) {
    return $http.post('/dust/request/alertSetting', params)
  },


  /**
   * 查询数据请求的默认配置 1.0版本
   * @param： 
   * @returns：
   */
  queryDefaultSetting(){
    return $http.get('/dust/request/byVersion',{params:{version:'1.0'}})
  }



}



