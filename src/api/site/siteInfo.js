

import {$http} from '@/api/index.js'
export default {

   /**
   *  根据设备编码查询该站点信息
   */
  querySiteInfoByMnCode(mnCode) {
    let params = {}
    params.mnCode = mnCode
    return $http.get('/dust/siteInfo/info',{params:params})
  },


  /**
   *  查询所有的运维商
   */
  queryDutyCompany() {
    return $http.get('/dust/siteInfo/dutyCompany')
  },


   /**
   *  根据地址查询街道
   */
  queryStreet(street) {
     return $http.get('/dust/siteInfo/street',{params:{street:street}})
  },


  /**
   * 获取不同的异常类型
   */
  queryScenarioTypeName(){
    return $http.get('/dust/scenario')
  },

  /**
   * 根据点位名字查询对应的设备编号
   * @param： 
   * @returns：
   */
  queryMnCode(siteName){
    return $http.get('/dust/siteInfo/mncode',{params:{siteName:siteName}})
  }

}