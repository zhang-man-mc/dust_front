<!-- 区域和检测类型

    **父组件
    <AreaAndmonitorType ></AreaAndmonitorType>
-->

<script>
  export default {
    props:{ 
      isHideArea:{
        type:Number,
        default:0
      }
     
    },
    emits:['submitArea','submitMonitore'],
        
    data() {
      return{
        areaValue:'金山区',
        monitorValue:'扬尘',
        areas:['金山区','徐汇区'],
        monitorTypes:['扬尘','油烟']
      }
    },
    mounted() {

    },
    methods: {
        /**
         * 区域选中值发生变化时，将值发送给父组件
         * @param： 目前的选中值
         */
        submitAreaValue(val){
            this.$emit('submitArea',val)
        },

        /**
         * 监测类型选中值发生变化时，将值发送给父组件
         * @param： 目前的选中值
         */
        submitMonitorValue(val){
            this.$emit('submitMonitore',val)
        }
     }
}
</script>

<template>
<div class="container">
  <div class="container-text" v-show="!isHideArea"> 
    <el-text size="large" class="text">区域：</el-text>
    <el-select v-model="areaValue" disabled placeholder="Select" size="default"  @change="submitAreaValue">
    <el-option
      v-for="item in areas"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</div>

<div>
  <el-text class="text">监测类型：</el-text>
    <el-select v-model="monitorValue"  disabled  placeholder="Select" size="default"  @change="submitMonitorValue">
    <el-option
      v-for="item in monitorTypes"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</div>
</div>

</template>

<style  scoped>
.el-select {
    width: 100px;
}
.container {
  display: flex;
}
.container-text {
  margin-right: 30px;
}
.text {
  
  color: #333333;
  font-size: 14px;
}

</style>