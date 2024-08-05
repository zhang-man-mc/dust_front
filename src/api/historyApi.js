import { $http } from './index'

export default {
  // 查询历史数据 不分页
  queryHistoryData({ siteName, mnCode, beginTime, endTime, scenarioType }) {
    const params = {
      beginTime: beginTime,
      endTime: endTime
    }
    if (siteName) {
      params.siteName = siteName
    }
    if (mnCode) {
      params.mnCode = mnCode
    }
    if (scenarioType) {
      params.scenarioType = scenarioType
    }

    return $http.get('/dust/historyall', {
      params: params
    })
  },

  


}
