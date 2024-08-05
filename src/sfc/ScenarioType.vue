
<!-- 场景类型复选框组件  
    自动获取扬尘历史表中不同场景类型
    将选中的多个场景以数组形式返回给父组件 

    **
    在父组件中设置
    <ScenarioType @submitScenarioType="(val) => (scenarioType = val)"> </ScenarioType>
-->
<script>
import siteInfo from '@/api/site/siteInfo.js'
export default {
  emits:['submitScenarioType'],
  data() {
    return {
      //异常表所有的异常类型
      scenarioType: [],
      //已勾选的场景
      checkedList: []
    };
  },
  methods: {
    //获取不同的异常类型
    getScenarioTypeName() {
      siteInfo.queryScenarioTypeName().then(result => {
        this.scenarioType = result.data.data
      });
    }
    //根据异常个数渲染checkbox
  },
  mounted(){
    this.getScenarioTypeName()
  }
};
</script>

<template>
  
  <div class="container">
    <span class="text">场景类型：</span>
  <div class="exception-type">
  <el-checkbox-group v-model="checkedList" :change="$emit('submitScenarioType',checkedList)">
    <el-checkbox :label="item.typeName"  v-for="(item,index) in scenarioType" :key="index">
        <template #default>
            <span v-if="item.typeName== '建筑工地'">建筑工地</span>
            <span v-else-if="item.typeName == '搅拌站'">搅拌站</span>
            <span v-else-if="item.typeName == '码头'">码头</span>
        </template>
    </el-checkbox>
  </el-checkbox-group>
</div>
</div>
</template>

<style scoped>
/* 不能对  */
.container {
    display: flex;
    /* flex-wrap: wrap; */
}
.text {
    margin-top: 5px;
    margin-right: 10px;
    margin-left: 5px;
    font-weight: bolder;
    white-space: nowrap;
    color: #333333;

}
.exception-type {
  white-space: nowrap;
  margin-top: 5px;
}
</style>
