

export default {
    /**
     * 由单条月度值计算风险值
     * @param： 
     * @returns：
     */
    calRiskValue(monthlyRiskData) {
        // 风险值
        let riskValue = monthlyRiskData.onlineRisk*0.1 + monthlyRiskData.validRisk*0.2 + monthlyRiskData.exceedRisk*0.2 + monthlyRiskData.exceptionTypeAggregation*0.2 + monthlyRiskData.typicalExceptionRepetitionRate*0.3
        return riskValue
    },
    

    /**
     * 计算月度风险值
     * @param： 
     * @returns：
     */
    calMonthlyRiskValue(exceptionRiskValue){
        // 保存月度风险值
        let monthlyRiskValue = []
        // 计算每个站点的月度风险值
        for(let item in exceptionRiskValue){
            let risk = this.calRiskValue(item)
            monthlyRiskValue.push(risk)
        }

        // 降序排列
        monthlyRiskValue.sort((a, b) => b - a)
        
        return monthlyRiskValue 
    },

    /**
     * 组装成表格的行
     * @param： 站点的月度分险数据，该站点的月度风险值
     * @returns：
     */
    organizeTableRow(monthlyRiskData,riskValue) {
        let obj = {}
        obj.siteName = monthlyRiskData.name
        obj.region = '金山区'
        obj.mnCode = monthlyRiskData.mnCode
        obj.monitorType = '扬尘'
        obj.riskValue = riskValue
        obj.beginTime = monthlyRiskData.lst
        obj.endTime = monthlyRiskData.lst

        // 根据月度风险值，返回对应的风险等级和风险建议
        let riskGradeAndAdvice  = this.judgeRiskGradeAndAdvice(riskValue)
        obj.riskGrade = riskGradeAndAdvice[0]
        obj.riskAdvice = riskGradeAndAdvice[1]

        return obj
    },

    /**
     * 根据月度风险值，返回对应的风险等级和风险建议 
     * @param： 月度风险值
     */
    judgeRiskGradeAndAdvice(monthlyRiskValue){
        let temp = []
        // 低风险
        if(monthlyRiskValue < 0.15) {
            temp.push('低风险')
            let advice =  '1.建议及时提醒该站点所属单位进行应急维护；\n2.若同时存在超标、临界超标、量级突变等异常时，建议将该站点移交环境执法大队开展现场执法检查；\n3.若持续两月及以上为高风险，建议将该站点纳入年度抽测比对清单；'
            temp.push(advice)
        }
        // 中风险
        if (monthlyRiskValue <= 0.6 && monthlyRiskValue >= 0.15) {
            temp.push('中风险')
            let advice =  '1.建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，聚焦当前存在的问题或隐患，及时开展自查自纠；\n2.若同时存在在线率或有效率月度不达标，建议电话通知该站点所属单位进行应急维护，并进行专项审核；'
            temp.push(advice)
        }
        // 高风险
        if (monthlyRiskValue > 0.6) {
            temp.push('高风险')
            let advice = '1.若不涉及超标或在线率、有效率异常，常态数据审核即可；\n2.若涉及超标或在线率、有效率等异常，建议通过守法服务小程序、监测监管微信群等线上方式提示站点所属单位，及时开展自查自纠；'
            temp.push(advice)
        }
        return temp
    },


    // 遍历对每条月度异常风险值
        // 计算综合风险值
        // 拼接新的对象
    // 返回表格对象

    /**
     * 返回综合风险排名的表格数据
     * @param： 各站点月度分险数据
     * @returns：表格数据
     */
   backComprehensiveRiskTableData(allExceptionData){
        let tableData = []
        // 遍历对每条月度异常风险
        allExceptionData.forEach(element => {
            
            // 计算得到月度风险值
            let monthlyRiskValue = this.calRiskValue(element)
            // 组成表格行的字段
            let tableRow = this.organizeTableRow(element,monthlyRiskValue.toFixed(2))

            tableData.push(tableRow)
        });

        return tableData
   }



   


}