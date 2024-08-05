<script>
import dayjs from 'dayjs';
  export default {
    props: {
    dayBegin:{
        type:String,
        default:''
    }
  },
  emits: ['submitTime'],
    data() {
      return{
        day:'',
        shortcuts : [
        {
          text: '前一日',
          value: () => {
            const start = dayjs().subtract(1,'day').format('YYYY-MM-DD')
            return start
          }
        },

        {
          text: '前7天',
          value: () => {
            const start = dayjs().subtract(7,'day').format('YYYY-MM-DD');
            return start
          }
        },
        {
          text: '上一月',
          value: () => {
            const start = dayjs().subtract(1,'month').format('YYYY-MM-DD');
            return start
          }
        }
        ]
      }
    },
    watch:{
        dayBegin(){
            if(this.dayBegin!=''){
                this.day=this.dayBegin
            }
        }
    },
    mounted() {
        this.$emit('submitTime', this.day);
    },
    methods: {
        disabledDate(day) {
        return day.getTime() > Date.now()
        }
     }
}
</script>

<template>
    <div class="block">
        <span class="demonstration">选择日期：</span>
        <el-date-picker
          v-model="day"
          type="date"
          placeholder="选择日期"
          :disabled-date="disabledDate"
          :shortcuts="shortcuts"
          @change="$emit('submitTime', day)"
        
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