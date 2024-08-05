<!-- 异常情况的 折线图组件
子组件有基本的样式 
使用同一个图形实例，接受父组件传入的折线图option
**父组件

 -->
<template>
  <div id="main" class="line-chart-exception"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    option: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    // 获取页面宽度的一半
    this.initChart()
    this.chart.clear
    this.chart.setOption(this.option, true)
    window.addEventListener('resize', this.resizeChart)
  },
  watch: {
    option() {
      // this.chart.clear
      // 不与之前的option进行合并
      this.chart.setOption(this.option, true)
    }
  },

  methods: {
    initChart() {
      // 创建echarts实例
      this.chart = echarts.init(document.getElementById('main'))
      // 定义图表的配置项和数据
      const option = {
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {},
        toolbox: {
          // 工具栏
          feature: {
            // dataZoom: {
            //   // 区域缩放
            //   yAxisIndex: 'none'
            // },
            // 保存为图片
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '颗粒物浓度',
            type: 'line',
            data: []
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表
      this.chart.setOption(option, true)
    },

    // 跟页面响应式变化
    resizeChart() {
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.resize()
        }
      })
    }
  }
}
</script>

<style scoped>
.line-chart-exception {
  width: 600px;
  height: 250px;
  margin-bottom: 20px;
  min-width: 500px;
}
</style>
