<!-- 单个 日期时间选择器组件  
  将初始默认时间（一周前）和改变的时间通过事件‘submitTime’传递给父组件
  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
    <TimeSinglePicker @submit-time="(n) => (form.staticsDailyTime = n)"  :selected-time="form.staticsDailyTime"/>
  ***
-->

<script>
import time from '@/utils/time.js'
export default {
  props: {
    // 父组件传入的时间
    selectedTime: {
      // type: [String,null],
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
    },
    isDisabled: {
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
        // this.time = time.utcToStr(this.selectedTime)
        this.time = this.selectedTime
      }
    }
  },

  mounted() {
    this.time = time.utcToStr(this.selectedTime)
  },

  methods: {
    change() {
      if (this.time != null) {
        let t = time.utcTime(this.time)
        this.isUTC ? this.$emit('submitTime', t) : this.$emit('submitTime', this.time)
      } else {
        this.$emit('submitTime', this.time)
      }
    }
  }
}
</script>

<template>
  <el-date-picker v-model="time" type="datetime" placeholder="选择时间" @change="change" />
</template>

<style scoped></style>
