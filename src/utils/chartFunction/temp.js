/* 飞行巡检页面的函数 */


import historyApi from '@/api/historyApi.js'
export default {
  
  async getHistoryData(siteName, beginTime, endTime) {
    
   const hData = await historyApi.queryHistoryData({
      siteName: siteName,
      beginTime: beginTime,
      endTime:endTime
   })
    
    
  }

}