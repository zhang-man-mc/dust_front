/** 异常数据的折线图 */

export default {
  /**
   * 设置9种异常折线图
   * @param：x轴时间， y轴油烟浓度
   * @param：异常开始时间，异常结束时间，异常开始时间在整个区间的索引下标，异常结束时间在整个区间的索引下标，颜色背景的区间对象结构
   * @param：异常类型
   * @returns：
   */
  setExceptionChartOption({
    xData,
    yData,
    exceptionBeginTime,
    exceptionEndTime,
    beginIndex,
    endIndex,
    exceptionName,
    areaObj,
    lineColor,
    exceptionType
  }
  ) {
    switch (exceptionType) {
      case '0':
        return this.missingDataOption(
          xData,
          yData,
          exceptionBeginTime,
          exceptionEndTime,
          exceptionName
        )
      case '1':
        return this.ultraLowOption(xData, yData, beginIndex, endIndex, exceptionName)
      case '2':
        return this.exceedingOption(
          xData,
          yData,
          exceptionBeginTime,
          exceptionEndTime,
          beginIndex,
          endIndex,
          exceptionName
        )

      case '3':
        return this.longtimeUnchangedOption(
          xData,
          yData,
          exceptionBeginTime,
          exceptionEndTime,
          beginIndex,
          endIndex,
          exceptionName
        )
      case '4':
      case '5':
      case '6':
      case '7':
        return this.exception4567TypeOption(
          xData,
          yData,
          exceptionBeginTime,
          exceptionEndTime,
          beginIndex,
          endIndex,
          exceptionName
        )
      case '8':
        console.log('传进来',lineColor)
        return this.validOption(xData, yData, exceptionName, areaObj,lineColor)
    }
  },

  /**
   * 数据缺失
   * @param：
   * @returns：
   */
  missingDataOption(xData, yData, exceptionBeginTime, exceptionEndTime, exceptionName) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData,
          markLine: {
            silent: true,
            data: [
              // 标注无数据时间段的效果，将这个时间段的数轴部分变为红色
              {
                name: '无数据',
                xAxis: exceptionBeginTime
              },
              {
                xAxis: exceptionEndTime
              }
            ],
            lineStyle: {
              color: 'red'
            }
          }
        }
      ]
    }
  },

  /**
   * 超标
   * @param：
   * @returns：
   */
  exceedingOption(
    xData,
    yData,
    exceptionBeginTime,
    exceptionEndTime,
    beginIndex,
    endIndex,
    exceptionName
  ) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData.map((item) => {
            if (item >= 1) {
              return {
                value: item,
                itemStyle: {
                  color: 'red'
                }
              }
            }
            return item
          }),
          // 变换指定时间区间的背景颜色
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: [
              [
                {
                  name: '异常时间段',
                  xAxis: exceptionBeginTime
                },
                {
                  xAxis: exceptionEndTime
                }
              ]
            ]
          },
          markLine: {
            symbol: 'none',
            itemStyle: {
              // 基线公共样式
              normal: {
                lineStyle: {
                  type: 'dashed'
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '{b}'
                }
              }
            },
            data: [
              {
                name: '超标',
                type: 'average',
                yAxis: 1,
                lineStyle: {
                  // color: '#ff0000'
                  color: 'red'
                }
              }
            ]
          }
        }
      ],
      // 指定时间区间的线段变颜色
      visualMap: {
        show: false,
        dimension: 0,
        pieces: [
          {
            lte: beginIndex,
            color: 'green'
          },
          {
            gt: beginIndex,
            lte: endIndex,
            color: 'red'
          },
          {
            gt: endIndex,
            lte: xData.length - 1,
            color: 'green'
          }
        ]
      }
    }
  },

  /**
   * 数据超低
   * @param：
   * @returns：
   */
  ultraLowOption(xData, yData, beginIndex, endIndex, exceptionName) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData.map((item) => {
            if (item <= 0.02) {
              return {
                value: item,
                itemStyle: {
                  color: 'red'
                }
              }
            }
            return item
          }),

          markLine: {
            symbol: 'none',
            itemStyle: {
              // 基线公共样式
              normal: {
                lineStyle: {
                  type: 'dashed'
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '{b}'
                }
              }
            },
            data: [
              {
                name: '数据超低',
                type: 'average',
                yAxis: 0.02,
                lineStyle: {
                  color: 'red'
                }
              }
            ]
          }
        }
      ],
      // 指定时间区间的线段变颜色
      visualMap: {
        show: false,
        dimension: 0,
        pieces: [
          {
            lte: beginIndex,
            color: 'green'
          },
          {
            gt: beginIndex,
            lte: endIndex,
            color: 'red'
          },
          {
            gt: endIndex,
            lte: xData.length - 1,
            color: 'green'
          }
        ]
      }
    }
  },

  /**
   * 长时间无波动
   * @param：
   * @returns：
   */
  longtimeUnchangedOption(
    xData,
    yData,
    exceptionBeginTime,
    exceptionEndTime,
    beginIndex,
    endIndex,
    exceptionName
  ) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData.map((item) => {
            if (item >= 1) {
              return {
                value: item,
                itemStyle: {
                  color: 'red'
                }
              }
            }
            return item
          }),
          // 变换指定时间区间的背景颜色
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: [
              [
                {
                  name: '异常时间段',
                  xAxis: exceptionBeginTime
                },
                {
                  xAxis: exceptionEndTime
                }
              ]
            ]
          }
        }
      ],
      // 指定时间区间的线段变颜色
      visualMap: {
        show: false,
        dimension: 0,
        pieces: [
          {
            lte: beginIndex,
            color: 'green'
          },
          {
            gt: beginIndex,
            lte: endIndex,
            color: 'red'
          },
          {
            gt: endIndex,
            lte: xData.length - 1,
            color: 'green'
          }
        ]
      }
    }
  },

  /**
   * 量级突变 临近超标异常 单日超标次数临界异常 变化趋势异常
   * @param：
   * @returns：
   */
  exception4567TypeOption(
    xData,
    yData,
    exceptionBeginTime,
    exceptionEndTime,
    beginIndex,
    endIndex,
    exceptionName
  ) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData,
          // 变换指定时间区间的背景颜色
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: [
              [
                {
                  name: '异常时间段',
                  xAxis: exceptionBeginTime
                },
                {
                  xAxis: exceptionEndTime
                }
              ]
            ]
          }
        }
      ],
      // 指定时间区间的线段变颜色
      visualMap: {
        show: false,
        dimension: 0,
        pieces: [
          {
            lte: beginIndex,
            color: 'green'
          },
          {
            gt: beginIndex,
            lte: endIndex,
            color: 'red'
          },
          {
            gt: endIndex,
            lte: xData.length - 1,
            color: 'green'
          }
        ]
      }
    }
  },

  /**
   * 有效率
   * @param：
   * @returns：
   */
  validOption(xData, yData, exceptionName, areaObj,lineColor) {
    return {
      title: {
        text: exceptionName,
        left: '1%',
        textStyle: {
          fontSize: 14
        }
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
        type: 'category',
        data: xData,
        name: '时间',
        axisLabel: {
          formatter: function (value) {
            return value.slice(11, -3)
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'mg/m³'
      },
      series: [
        {
          name: '颗粒物浓度',
          type: 'line',
          data: yData,
          //   yData.map((item) => {
          //   if (item >= 1) {
          //     return {
          //       value: item,
          //       itemStyle: {
          //         color: 'red'
          //       }
          //     }
          //   }
          //   return item
          // }),
          // 变换指定时间区间的背景颜色
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: areaObj
          }
        }
      ],
      // 指定时间区间的线段变颜色
      // visualMap: {
      //   show: false,
      //   dimension: 0,

      //   // pieces: [
      //   //   {
      //   //     lte: beginIndex,
      //   //     color: 'green'
      //   //   },
      //   //   {
      //   //     gt: beginIndex,
      //   //     lte: endIndex,
      //   //     color: 'red'
      //   //   },
      //   //   {
      //   //     gt: endIndex,
      //   //     lte: xData.length - 1,
      //   //     color: 'green'
      //   //   }
      //   // ],

      //   pieces: lineColor

      // }
    }
  }
}
