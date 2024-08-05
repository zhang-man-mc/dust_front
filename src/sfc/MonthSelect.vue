<!--月份选择器组件    
    默认选择上个月

  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
    <MonthSelect @submit-value="giveMonth"></MonthSelect>
   giveTime(val) {
        将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
        this.month = dayjs(val).format('YYYY-MM-DD');
      },
  ***
-->

<script>
import dayjs from 'dayjs';
import time from '@/utils/time.js'
  export default {
    props:{
      month:{
         type:String,
        default:''
      }
    },
    emits:['submitValue'],
    
    data() {
      return{
        value:''
      }
    },
    watch:{
      month(){
        if(this.month!=''){
          this.value = this.month
        }
      }
    },
    mounted() {
        this.pre_month()
    },
    methods: {
        pre_month(){
          this.value = dayjs().subtract(1,'month').startOf('month').format('YYYY-MM-DD')
          this.$emit('submitValue',this.value)
        },
      judgeDateValid(date) {
          return time.judgeDateValid(date)
        }
     }
}
</script>

<template>
      <div class="block">
        <span class="demonstration">月份：</span>
        <el-date-picker
          v-model="value"
          type="month"
          placeholder="选择月份"
          :disabled-date="judgeDateValid"
          @change="$emit('submitValue',value)"
        />
      </div>
</template>

<style  scoped>

.demonstration {
  color: #333333;
  font-weight: bold;
  font-size: 14px;
}
</style>