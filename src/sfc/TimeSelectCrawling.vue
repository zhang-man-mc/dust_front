<!-- 日期时间选择器组件  --用与Python爬虫页面

    开始时间：数据库最新一条数据时间、
    结束时间：当前时间
    会将起始时间和改变的时间通过事件‘submitTime’传递给父组件
  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
  <TimeSelectCrawling @submit-time="giveTime"></TimeSelectCrawling>
   giveTime(val) {
        //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
        this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss');
        this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss');
      },
  ***
-->
<script>
import axiosInstance from '../utils/request.js'
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
    this.initOneWeekAgoTime()
    setTimeout(() => {
    this.$emit('submitTime', this.time);
    }, 500);
  },

  methods:{
    initOneWeekAgoTime(){
      // 给时间选择器设置默认时间为一周前
    // this.time[0] = dayjs().subtract(2, 'week').format('YYYY-MM-DD HH:mm:ss');
    this.getLastestTimeFromMySql()
    this.time[1] = dayjs().format('YYYY-MM-DD HH:mm:ss');
    },
    getLastestTimeFromMySql(){
        axiosInstance.get('/fume/lastesttime').then(response=>{
            this.time[0] = response.data.data[0].mvDataTime
        })
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
      start-placeholder="Start date"
      end-placeholder="End date"
      @change="$emit('submitTime', time)"
      class="pick-date"

    />
  </div>
</template>

<style>
.demonstration {
  margin-top: 5px;
  font-weight: bold;
  white-space: nowrap;
}
.block {
  display: flex;
  justify-content: center;
  /* width: 50%; */
  white-space: nowrap;
  width: 40%;
}
.pick-date {
  width: 100%;

} 
</style>
