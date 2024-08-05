import {$http_py} from '@/api/index.js';

export default {
   
    /**
     * 自动获取
     * @param： 
     * @returns：
     */
    fetchDustHistoryData(){
        return $http_py.get('getDustData')
    }

}