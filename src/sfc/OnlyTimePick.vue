<!-- 时间选择器组件 

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
import time from '@/utils/time.js'
export default {
  props: {
    // 父组件传入的时间
    selectedTime: {
      type: String,
      default: ''
    },
    // 是否设置只读属性
    readOnly: {
      type: Boolean,
      default: false
    },
    isUTC: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submitTime'],
  data() {
    return {
      time: ''
    }
  },
  watch: {
    selectedTime(newVal) {
      if (newVal != '') {
        this.time = this.selectedTime
      }
    }
  },
  mounted() {
    this.time = this.selectedTime
  },
  methods: {
    change() {
      let t = time.utcTime(this.time)
      console.log('isUTC', this.isUTC)
      console.log('时间', t)
      this.isUTC ? this.$emit('submitTime', t) : this.$emit('submitTime', this.time)
    }
  }
}
</script>

<template>
  <el-time-picker v-model="time" placeholder="选择时间" editable @change="change" />
</template>

<style scoped></style>
