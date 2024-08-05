<!--浓度均值 数据在线率 有效率 超标率 图组件
子组件有基本的样式 
使用同一个图形实例，接受父组件传入的折线图option
 -->
<template>
  <div ref="chart" class="line-chart11"></div>
</template>

<script>
import * as _echarts from 'echarts'

export default {
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => {
        return {
          x: [],
          y: []
        }
      }
    },
    title: {
      type: String
    },
    xName: {
      type: String,
      default: '时间'
    },
    yName: {
      type: String,
      default: '百分比'
    },
    seriesName: {
      type: String,
      default: '系列一'
    },
    areaColor: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.intiChart()

    window.addEventListener('resize', this.resizeChart)
  },
  watch: {
    chartData() {
      // option变化时，图形再次初始化
      this.setOption()
    }
  },

  methods: {
    intiChart() {
      // 创建echarts实例
      this.chart = _echarts.init(this.$refs.chart)
    },

    setOption() {
      // 定义图表的配置项和数据
      const option = {
        title: {
          text: this.title
        },
        tooltip: {},

        toolbox: {
          // 工具栏
          feature: {
            // 保存为图片
            saveAsImage: {}
          }
        },
        xAxis: {
          name: this.xName,
          data: this.chartData.x,
          type: 'category',
          axisLabel: {
            formatter: function (value) {
              return value.slice(5)
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            interval: 'auto'
          },
          name: this.yName
        },
        series: [
          {
            name: this.seriesName,
            type: 'line',
            data: this.chartData.y,
            // 变换指定时间区间的背景颜色

            markArea: {
              itemStyle: {
                color: '#e5e6eb'
              },

              data: this.areaColor
            }
          }
        ]
      }
      this.chart.setOption(option)
    },

    // 跟页面响应式变化
    resizeChart() {
      setTimeout(() => {
        this.chart.resize()
      }, 1000)
    }
  }
}
</script>

<style>
.line-chart11 {
  width: 600px;
  height: 300px;
  margin-top: 25px;
  margin-left: 30px;
  color: #535a64;
}
</style>
