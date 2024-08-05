import dayjs from 'dayjs'
export default  {




    /**
     * description：返回时间数组，间隔15分钟。
     * @param： 异常的开始,异常结束时间
     * @createTime:2023-08-17
     * @returns：比如12:00:00-13:00:00 所以返回的数组元素是 12:00:00 ,12:15:00,12:30:00,12:45:00，13:00:00
     */
    descFiftyTime(begin, end) {
        let time = [];
        if (begin == end) {
          time.push(begin);
          return time;
        }
        time.push(begin);
        let temp = dayjs(begin).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');
        while (temp >= end) {
          time.push(temp);
          temp = dayjs(temp).add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');
        }
        // 加上异常的结束时间
        time.push(temp);
        return time;
      },

      /**
     * description：返回开始时间的前45分钟的时间点，结束时间后45分钟的时间点
     * @param： 异常的开始时间，异常的结束时间。
     * @returns：数组。time[0],time[1],time[2],time[3]分别代表异常区间前45分钟的时间点，前15分钟的时间点,后15分钟的时间点，后45分钟的时间点
     */
    before45AndAfter45(begin, end) {
        let time = [];
        // 前一段的开始时间
        const before45MinBegin = dayjs(begin)
          .subtract(45, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        // 前一段的结束时间
        const before15MinBegin = dayjs(begin)
          .subtract(15, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
  
        // 后一段的开始时间
        const after15MinBegin = dayjs(end)
          .add(15, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        // 往后40分钟
        const after45MinEnd = dayjs(end)
          .add(45, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        time.push(before45MinBegin);
        time.push(before15MinBegin);
        time.push(after15MinBegin);
        time.push(after45MinEnd);
        return time;
      },

       /**
     * description：返回某站点在该时段历史数据的get请求参数
     * @param： 站点名称， 开始时间， 结束时间
     * @returns：对象
     */
    requestGetParms(name, begin, end) {
        return {
          siteName: name,
          beginTime: begin,
          endTime: end
        };
      },
      /**
     * description：相差多少个15分钟  计算中包括开始时间，结束时间。
     * @param： 异常开始时间，异常结束时间
     * @returns：整数
     */
    diffFiftyMinutesNum(beginNormal, endNormal) {
        // 将开始时间和结束时间转换为dayjs对象
        const start = dayjs(beginNormal).subtract(15, 'minute');
        const end = dayjs(endNormal);
  
        // 计算结束时间减去开始时间中间相差多少个十分钟
        const diffInMinutes = end.diff(start, 'minute');
        const diffInTenMinutes = Math.floor(diffInMinutes / 15);
        return diffInTenMinutes;
      },
       /**
     * description：判断data中是否有该日期时间，存在返回该时间对应的浓度值，否则返回-1
     * @param： 加上前后区间的异常数据，时间字符串
     * @returns：
     */
    findTimeInExceptionData(data, time) {
        for (let i = 0; i < data.length; i++) {
          if (data[i] == null) {
            continue;
          }
          if (data[i]['lst'] == time) {
            return data[i]['dustValue'];
          }
        }
        return -1;
      },
      /**
     * description：根据开始和结束时间,返回以15分钟为间隔的时间和对应的值
     * @param： 前区间的开始时间， 后区间的结束时间, 加上前后区间的总时间段的异常数据的对象数组
     * @returns：对象。包含了折线图的x轴，y轴的配置数据
     */
    keepContinuousByEachFiftyMinutes(
        intervalStarTime,
        intervalEndTime,
        headAndTailExceptionData
      ) {
        let xAxis = [];
        let yAxis = [];
        let obj = {};
        let current = intervalStarTime;
        let tail = dayjs(intervalEndTime)
          .add(15, 'minute')
          .format('YYYY-MM-DD HH:mm:ss');
        while (current != tail) {
          let value = this.findTimeInExceptionData(
            headAndTailExceptionData,
            current
          );
          if (value != -1) {
            xAxis.push(current);
            yAxis.push(value);
          } else {
            xAxis.push(current);
            yAxis.push(null);
          }
          current = dayjs(current)
            .add(15, 'minute')
            .format('YYYY-MM-DD HH:mm:ss');
        }
        obj['xAxis'] = xAxis;
        obj['yAxis'] = yAxis;
        return obj;
      },

}