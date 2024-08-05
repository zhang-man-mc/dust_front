import {$http} from '@/api/index.js';

export default {
    /**
     * 根据站点，时间段查询分析表所有数据
     * @param： 请求参数对象
     * @returns
     */
    fetchAllData(argsObj){
        return $http.get('dust/analysisall',{params:argsObj});
    },

    /**
     * 根据站点，时间段查询历史表中所有数据
     * @param： 
     * @returns：
     */
    fetchAlSiteData(argsObj){
        
        return $http.get('dust/historyall',{params:argsObj});
    }

}