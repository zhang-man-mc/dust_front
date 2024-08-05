<!-- 日期选择器组件   带日周月快捷选项
  会将初始默认时间（一周前）和改变的时间通过事件‘submitTime’传递给父组件
  
  初始渲染时就将时间传递给父组件：
  ** 
  在父组件中设置
    <DateSelectWithShortCuts @submit-time="giveTime"></DateSelectWithShortCuts>
   giveTime(val) {
        //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
        this.beginTime = dayjs(val[0]).format('YYYY-MM-DD');
        this.endTime = dayjs(val[1]).format('YYYY-MM-DD');
      },
  ***
-->
<script>
import dayjs from 'dayjs';
export default {
  props: {
    timeType: {
      type: String,
      default: 'currentMonth'
    }
  },
  emits: ['submitTime'],
  data() {
    return {
      //保存开始和结束时间
      // 随便设置初始值 ，mounted时再设正确的，目的是改变时间了触发change
      time: ['2023-06-01', '2023-06-20'],
      shortcuts: []
    };
  },
  mounted() {
    this.initShortCuts();
    this.initOneWeekAgoTime();
    this.$emit('submitTime', this.time);
  },
  methods: {
    initShortCuts() {
      this.shortcuts = [
        {
          text: '前一日',
          value: () => {
            const start = dayjs().subtract(1,'day').format('YYYY-MM-DD')
            const end = dayjs().format('YYYY-MM-DD')
            return [start, end];
          }
        },

        {
          text: '前7天',
          value: () => {
            const start = dayjs().subtract(7,'day').format('YYYY-MM-DD');
            const end = dayjs().subtract(1,'day').format('YYYY-MM-DD');
            return [start, end];
          }
        },
        {
          text: '上一月',
          value: () => {
            const start = dayjs().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
            const end = dayjs().subtract(1,'month').endOf('month').format('YYYY-MM-DD');
            return [start, end];
          }
        }
      ];
    },


    initOneWeekAgoTime() {
      switch (this.timeType) {
        case 'day':
          this.time[0] = dayjs()
            .subtract(1, 'day')
            .format('YYYY-MM-DD');
          this.time[1] = dayjs().format('YYYY-MM-DD');
          break;
        case 'week':
          this.time[0] = dayjs()
            .subtract(1, 'week')
            .format('YYYY-MM-DD');
          this.time[1] = dayjs().format('YYYY-MM-DD');
          break;
        case 'month':
          this.time[0] = dayjs()
            .subtract(1, 'month')
            .format('YYYY-MM-DD');
          this.time[1] = dayjs().format('YYYY-MM-DD');
          break;
        case 'currentMonth':
          this.time[0] = dayjs().startOf('month').format('YYYY-MM-DD')
          this.time[1] = dayjs().subtract(1,'day').format('YYYY-MM-DD')
          break
        default:
          this.time[0] = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
          this.time[1] = dayjs().format('YYYY-MM-DD');
      }
    }
  }
};
</script>

<template>
  <div class="block">
    <span class="demonstration">起止时间：</span>
    <div class="pick-date">
    <el-date-picker
      v-model="time"
      type="daterange"
      :shortcuts="shortcuts"
      range-separator="~"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      value-format="YYYY-MM-DD"
      @change="$emit('submitTime', time)"
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
