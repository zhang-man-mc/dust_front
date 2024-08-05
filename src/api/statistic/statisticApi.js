import { $http } from '@/api/index.js'
export default {

  /**
   * 按照自定义排序获取日统计数据
   */
  fetchDayStatisticByOrder({
    page,
    pageSize,
    siteName = '',
    beginTime = null,
    endTime = null,
    orderProp,
    asc = true
  }) {
    let params = {
      page: page,
      pageSize: pageSize,
      siteName: siteName,
      beginTime: beginTime,
      endTime: endTime,
      orderProp: orderProp,
      asc: asc
    }
    return $http.get('/dust/analysistime', { params: params })
  }
}
