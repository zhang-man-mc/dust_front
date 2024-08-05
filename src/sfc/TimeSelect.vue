<!-- 日期时间选择器组件  
  会将初始默认时间（一周前）和改变的时间通过事件‘submitTime’传递给父组件
  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
  <TimeSelect @submit-time="giveTime"></TimeSelect>
   giveTime(val) {
        //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
        this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss');
        this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss');
      },
  ***
-->
<script>
import dayjs from 'dayjs'
export default {
  emits: ['submitTime'],

  data() {
    return {
      //保存开始和结束时间
      // 随便设置初始值 ，mounted时再设正确的，目的是改变时间了触发change
      time: ['2023-06-01 12:00:00', '2023-06-20 16:00:00']
    };
  },

  // 将初始默认开始和结束时间传递给父组件
  mounted() {
    this,this.initOneWeekAgoTime()
    this.$emit('submitTime', this.time);
  },

  methods:{
    initOneWeekAgoTime(){
      // 给时间选择器设置默认时间为一周前
    this.time[0] = dayjs().subtract(6, 'week').format('YYYY-MM-DD HH:mm:ss');
    this.time[1] = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
  }
};
</script>

<template>
  <!-- 日期时间选择器 -->
  <div class="block">
    <span class="demonstration">起止时间：</span>
    <el-date-picker
      v-model="time"
      type="datetimerange"
      range-separator="~"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      @change="$emit('submitTime', time)"
      class="pick-date"

    />
  </div>
</template>

<style>

.block {
  display: flex;
  justify-content: center;
  width: 90%;
  white-space: nowrap;
}

.demonstration {
  margin-left: 15px;
  margin-top: 5px;
  font-weight: bold;
  white-space: nowrap;
}
.pick-date {
  width: 100%;
  margin-top: 5px;
} 
</style>
