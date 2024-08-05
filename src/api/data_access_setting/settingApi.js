import {$http} from '@/api/index.js';

export default {

    /**
     * 根据站点，时间段查询历史表中所有数据
     * @param： 
     * @returns：
     */
    submitSetting(argsObj){
        
        return $http.post('dust/setting',argsObj);
    }

}