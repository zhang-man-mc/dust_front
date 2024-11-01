<!-- 日期时间选择器组件   带日周月快捷选项
  前一天是当前时间的前一天的00点到23：59：59
  前七天 和 上一个月同样
  会将初始默认时间（一周前）和改变的时间通过事件‘submitTime’传递给父组件
  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
    <TimeShortCuts @submit-time="giveTime"></TimeShortCuts>
   giveTime(val) {
        将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
        this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss');
        this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss');
      },
  ***
-->

<script>
import dayjs from 'dayjs'
import time from '@/utils/time.js'
export default {
  props: {
    beginAndEndTime: {
      type: Array,
      default: () => {
        return []
      }
    },
    timeType: {
      type: String,
      default: 'month'
    },
    // 是否设置只读属性
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submitTime'],
  data() {
    return {
      //保存开始和结束时间
      // 随便设置初始值 ，mounted时再设正确的，目的是改变时间了触发change
      time: ['2023-06-01 12:00:00', '2023-06-20 16:00:00'],
      shortcuts: [],
      defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
    }
  },
  watch: {
    beginAndEndTime() {
      if (this.beginAndEndTime.lenth != 0) {
        this.time = this.beginAndEndTime
      }
    }
  },
  mounted() {
    this.initShortCuts()
    // this.initOneWeekAgoTime()
    this.$emit('submitTime', ['2023-07-01 00:00:00', '2023-07-01 23:59:59'])
  },
  methods: {
    initShortCuts() {
      this.shortcuts = [
        {
          text: '前一日',
          value: () => {
            if (this.time[0] == '2023-06-01 12:00:00' && this.time[1] == '2023-06-20 16:00:00') {
              const start = dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00')
              const end = dayjs().subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
              return [start, end]
            } else {
              const start = dayjs(this.time[0]).subtract(1, 'day').format('YYYY-MM-DD 00:00:00')
              const end = dayjs(this.time[1]).subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
              return [start, end]
            }
          }
        },

        {
          text: '前7天',
          value: () => {
            if (this.time[0] == '2023-06-01 12:00:00' && this.time[1] == '2023-06-20 16:00:00') {
              const start = dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00')
              const end = dayjs().subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
              return [start, end]
            } else {
              const start = dayjs(this.time[0]).subtract(7, 'day').format('YYYY-MM-DD 00:00:00')
              const end = dayjs(this.time[1]).subtract(7, 'day').format('YYYY-MM-DD 23:59:59')
              return [start, end]
            }
          }
        },
        {
          text: '上一月',
          value: () => {
            if (this.time[0] == '2023-06-01 12:00:00' && this.time[1] == '2023-06-20 16:00:00') {
              const start = dayjs()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD HH:mm:ss')
              const end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
              return [start, end]
            } else {
              const start = dayjs(this.time[0]).subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
              const end = dayjs(this.time[1]).subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
              return [start, end]
            }
          }
        }
      ]
    },

    initOneWeekAgoTime() {
      switch (this.timeType) {
        case 'day':
          this.time[0] = dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00')
          this.time[1] = dayjs().subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
          break
        case 'week':
          this.time[0] = dayjs().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss')
          this.time[1] = dayjs().format('YYYY-MM-DD HH:mm:ss')
          break
        case 'month':
          this.time[0] = dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
          this.time[1] = dayjs().format('YYYY-MM-DD HH:mm:ss')
          break
        case 'currentMonth':
          this.time[0] = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss')
          this.time[1] = dayjs().subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
          // 防止在每月的1号，出现time[0]>time[1]的情况
          if (this.time[0] < this.time[1]) {
            break
          }
          break
        default:
          this.time[0] = dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
          this.time[1] = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    },
    judgeDateValid(date) {
      return time.judgeDateValid(date,'exceptionPage')
    }
  }
}
</script>

<template>
  <div class="block">
    <span class="demonstration">起止时间：</span>
    <div class="pick-date">
      <el-date-picker
        v-model="time"
        type="datetimerange"
        :shortcuts="shortcuts"
        range-separator="~"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled-date="judgeDateValid"
        @change="$emit('submitTime', time)"
        :default-time="defaultTime"
        :default-value="new Date(2023, 7, 1)"
        :readonly="readOnly"
      />
    </div>
  </div>
</template>

<style scoped>
.block {
  display: flex;
  width: 500px;
}
.demonstration {
  color: #333333;
  font-weight: bold;
  font-size: 14px;
}
</style>
