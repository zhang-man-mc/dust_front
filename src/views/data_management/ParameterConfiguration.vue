<script>
import TimeSinglePicker from '@/sfc/TimeSinglePicker.vue'
import CompEditRequest from '@/views/data_management/components/CompEditRequest.vue'
import CompEditException from '@/views/data_management/components/CompEditException.vue'
import dayjs from 'dayjs'
import exceptionSetting from '@/api/setting/exceptionSetting.js'
import requestTaskSetting from '@/api/setting/requestTaskSetting.js'
import { useLoginUserStore } from '@/stores/user'
export default {
  components: {
    TimeSinglePicker,
    CompEditRequest,
    CompEditException
  },
  data() {
    return {
      activeName: 'first',
      // 对话框显示
      dialog: {
        formRequestVisible: false,
        formExceptionVisible: false
      },
      // 请求任务配置数据
      requestData: [],
      // 异常分析配置数据
      exceptionSettingData: [],
      form_1: {
        user: '11',
        requestStartTime: '',
        requestEndTime: '',
        staticsDailyTime: '',
        staticsMonthlyTime: ''
      },
      // 加载中
      loading: {
        request: '',
        exception: ''
      }
    }
  },
  setup() {
    const userName = useLoginUserStore()
    return {
      userName
    }
  },
  watch: {

  },
  mounted() {},
  methods: {
    /**
     * 取消按钮
     * @param：
     * @returns：
     */
    cancelEvent() {
      this.$message.info('已取消')
    }
  }
}
</script>

<template>
  <el-row>
    <el-col>
      <em>参数配置</em>
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="数据获取" name="first">
          <CompEditRequest :user-name="userName.getUserName"></CompEditRequest>
        </el-tab-pane>

        <el-tab-pane label="异常分析" name="second">
          <CompEditException :user-name="userName.getUserName"></CompEditException>
        </el-tab-pane>
      </el-tabs>

    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin: 20px;
}
em {
  font-size: 30px;
  color: #333333;
}
.el-button {
  margin-top: 20px;
}
.el-table {
  color: #333333;
}
</style>
