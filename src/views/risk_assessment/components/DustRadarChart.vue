<!-- 雷达图

-->
<script>
import * as echarts from 'echarts';
export default {
  props: {
    // 属性
    name: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 数据
    yData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    yData: {
      handler() {
        this.set()
      },
      deep:true
    }
  },
  mounted() {
    this.initRadarChart();
    window.addEventListener('resize', this.resizeChart);
  },
  computed:{
    valid(){
      return (this.yData.validRisk*100).toFixed(2)
    },
    exceptionRecurrence(){
      return (this.yData.exceptionTypeAggregation*100).toFixed(2)
    },
    exceptionTypeAggregation(){
      return (this.yData.exceptionTypeAggregation*100).toFixed(2)
    },
    exceeding(){
      return  (this.yData.exceedRisk*100).toFixed(2)
    },
    online(){
      return   (this.yData.onlineRisk*100).toFixed(2)
    }
  },
  methods: {
    

    initRadarChart() {
      this.chart = echarts.init(document.getElementById('main'));
    },
    set() {
      let option = {
        title: {
          text: '综合风险'
        },
        tooltip: {},
        radar: {
          // 边框颜色
          splitLine: {
            lineStyle: {
              // 使用深浅的间隔色
              color: ['#ddd', '#aaa']
            }
          },
      
          indicator: [
            { name: this.name[0] +' '+ this.valid+'%', max: 1 },
            { name: this.name[1] +' '+ this.exceptionRecurrence+'%', max: 1 },
            { name: this.name[2] +' '+ this.exceptionTypeAggregation+'%', max: 1 },
            { name: this.name[3] +' '+ this.exceeding+'%', max: 1 },
            { name: this.name[4] +' '+ this.online+'%', max: 1 }

          ],

          axisName: {
            color: '#428BD4',
            },
          legend: {
            borderColor: '#428BD4'
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [
                  this.yData.validRisk.toFixed(4),
                  this.yData.typicalExceptionRepetitionRate,
                 this.yData.exceptionTypeAggregation,
                 this.yData.exceedRisk.toFixed(4),
                  this.yData.onlineRisk.toFixed(4)
                ],
   
                name: '异常分析'
              }
            ],
            label: {
              show: false,
            position: 'bottom',
            formatter: function(params) {
              return params.value*100+'%'
            }
            }
          }
        ]
      };
      this.chart.setOption(option);
    },
        // 跟页面响应式变化
        resizeChart() {
          this.chart.resize();
          // this.$nextTick(() => {
          //   if (this.chart) {
          //     this.chart.resize();
          //   }
          // });
      }
  }
};
</script>

<template>
  <div id="main" class="chart"></div>
</template>

<style scoped>
.chart {
  /* width: 650px; */
  width: 620px;
  height: 500px;
}
</style>
