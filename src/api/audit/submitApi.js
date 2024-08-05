import { $http } from '@/api/index.js';

export default {
    /**
     * 提交审核
     * @param： 审核人，审核人备注，企业备注，异常记录编号， 该条异常的审核状态
     * @returns：
     */
    submitAudit(reviewer,checkerNotes,enterpriseNotes,id,status){
        const params = {
            // checker:reviewer,
            checkerContent:checkerNotes,
            enterpriseContent:enterpriseNotes,
            exceptionId:id,
            auditStatus:status
        }

        
        if(reviewer == '' || reviewer  == null){
            params.checker = 'admin'
        }else{
            params.checker = reviewer
        }
        return $http.post('/dust/audit',params)
    },

    /**
     * 返回审核表所有数据
     * @param： 
     * @returns：
     */
    backAuditAllData(){
        return $http.get('dust/auditAllData')
    },

    /**
     * 更新审核记录
     * @param：  异常编号Id，审核人备注，企业备注，该条异常的审核状态
     * @returns：
     */
    updateAudit(id,checkerContent,enterpriseContent,auditStatus){
        const params = {
            exceptionId:id,
            auditStatus:auditStatus,
        }
        if(checkerContent){
            params.checkerContent = checkerContent
        }
        if(enterpriseContent){
            params.enterpriseContent = enterpriseContent
        }
        return $http.put('/dust/auditUpdate',params)
    },
    
    getAuditNumByTime(beginTime,endTime){
        if(beginTime!='' || endTime!=''){
            const params = {
                beginTime:beginTime,
                endTime:endTime
            }
            return $http.get('/dust/auditnum',{params:params})
        }
       
    }   
};
