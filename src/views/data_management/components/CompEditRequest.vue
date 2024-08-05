<script>
import TimeSinglePicker from '@/sfc/TimeSinglePicker.vue'
import OnlyTimePick from '@/sfc/OnlyTimePick.vue'
import requestTaskSetting from '@/api/setting/requestTaskSetting.js'
import { useCommonFunction } from '@/utils/common.js'
export default {
  components: {
    TimeSinglePicker,
    OnlyTimePick
  },
  props: {
    userName: {
      type: String,
      default: ''
    }
  },

  computed: {
    formDataAfterCal() {
      return {
        user: this.userName,
        region: this.form.region,
        // 是修改状态-->该记录的版本号  是新增状态--> 配置表表最大的版本号
        version: this.modify ? this.form.version : this.maxVersion,

        requestStartTime: this.form.requestStartTime,
        requestEndTime: this.form.requestEndTime,

        requestIntervalSeconds: this.requestIntervalSeconds,
        requestRangeHour: this.form.requestRangeHour,
        requestRangeIntervalSeconds: this.form.requestRangeIntervalSeconds,
        requestFailWaitSeconds: this.form.requestFailWaitSeconds,
        requestRetryTimes: this.form.requestRetryTimes,
        requestCookieValidDuration: this.form.requestCookieValidDuration,
        staticsDailyTime: this.form.staticsDailyTime,
        staticsMonthlyTime: this.form.staticsMonthlyTime,
        loginFailWaitSeconds: this.form.loginFailWaitSeconds,
        loginRetryTimes: this.form.loginRetryTimes,
        taskRetryWaitSeconds: this.form.taskRetryWaitSeconds,
        firstRequestOffsetDays: this.form.firstRequestOffsetDays
      }
    }
  },

  watch: {
    'form.requestIntervalSeconds': function (val, oldVal) {
      if (this.form.requestIntervalSeconds != '' && this.form.requestIntervalSeconds != null) {
        this.requestIntervalSeconds = this.form.requestIntervalSeconds / 3600
      }
    }
  },
  setup() {
    const { findMaxValue } = useCommonFunction()
    return { findMaxValue }
  },
  data() {
    return {
      form: {},
      requestIntervalSeconds: null,
      maxVersion: null,
      loading: false,
      // 修改状态
      modify: false,
    }
  },

  mounted() {
    this.queryRequest()
  },
  methods: {
    /**
     * 提交
     * @param：
     * @returns：
     */
    async submitForm() {
        await requestTaskSetting.submitRequestSetting(this.formDataAfterCal)

        this.$message.success('提交成功')

        // 数据提交后刷新表单
        this.queryRequest()

        // 置 表单修改结束标记
        this.isFormModify = false

    },

    // 回退到默认配置
    async defaultSetting() {
      if (this.form.version == '1.0') {
        this.$message.info('当前已经是默认的版本')
        return
      }
      this.loading = true
      await requestTaskSetting.queryDefaultSetting().then((Response) => {
        this.form = Response.data.data[0]
      })
      this.modify = true
      // 设置请求配置表版本1.0 的更新时间
      requestTaskSetting.alertRequestSetting(this.formDataAfterCal)
      this.modify = false
      this.loading = false

      this.$message.success('回退成功')
    },

    /**
     * 查询请求设置的数据
     * @param：
     * @returns：
     */
    queryRequest() {
      this.loading = true
      requestTaskSetting.queryRequestSetting().then((Response) => {
        this.loading = false
        this.form = Response.data.data[0]

        // 找到最大的版本
        const versions = Response.data.data.map((item) => item.version)
        this.maxVersion = this.findMaxValue(versions)
      })
    },
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

    <div class="my-header">
      <el-text tag="b"> 正在使用的版本：{{ form.version }}</el-text>
    </div>
    <el-form :model="form" label-width="210px" status-icon v-loading="loading" >
      <el-form-item label="用户名">
        <el-input :value="userName" disabled />
      </el-form-item>

      <el-form-item label="区县">
        <el-input :value="form.region" disabled />
      </el-form-item>

      <el-form-item label="开始时间">
        <TimeSinglePicker
          :selected-time="form.requestStartTime"
          :isUTC="true"
          @submit-time="(n) => (form.requestStartTime = n)"
        ></TimeSinglePicker>
      </el-form-item>

      <el-form-item label="结束时间">
        <TimeSinglePicker
          :selected-time="form.requestEndTime"
          :isUTC="true"
          @submit-time="(n) => (form.requestEndTime = n)"
        ></TimeSinglePicker>
      </el-form-item>

      <el-form-item label="获取频率" prop="requestIntervalSeconds">
        <el-input v-model.number="requestIntervalSeconds">
          <template #append>小时/次</template>
        </el-input>
      </el-form-item>

      <el-form-item label="任务分段时长" prop="requestRangeHour">
        <el-input v-model.number="form.requestRangeHour" :min="1" :max="10">
          <template #append>小时</template>
        </el-input>
      </el-form-item>
      <el-form-item label="分段执行的间隔" prop="requestRangeIntervalSeconds">
        <el-input v-model.number="form.requestRangeIntervalSeconds" :min="1" :max="10">
          <template #append>秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="获取任务异常时再次尝试间隔" prop="requestFailWaitSeconds">
        <el-input v-model.number="form.requestFailWaitSeconds" :min="1" :max="10">
          <template #append>秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="获取失败时再次尝试的总次数" prop="requestRetryTimes">
        <el-input v-model.number="form.requestRetryTimes" :min="1" :max="10">
          <template #append>次数</template>
        </el-input>
      </el-form-item>

      <el-form-item label="cookie有效时长" prop="requestCookieValidDuration">
        <el-input v-model.number="form.requestCookieValidDuration" :min="1" :max="10">
          <template #append>小时</template>
        </el-input>
      </el-form-item>

      <el-form-item label="日统计">
        <OnlyTimePick
          @submit-time="(n) => (form.staticsDailyTime = n)"
          :isUTC="true"
          :selected-time="form.staticsDailyTime"
        />
      </el-form-item>
      <el-form-item label="月统计">
        <OnlyTimePick
          @submit-time="(n) => (form.staticsMonthlyTime = n)"
          :isUTC="true"
          :selected-time="form.staticsMonthlyTime"
        />
      </el-form-item>
      <el-form-item label="登录失败等待时长" prop="loginFailWaitSeconds">
        <el-input v-model.number="form.loginFailWaitSeconds" :min="1" :max="10">
          <template #append>秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="登录失败尝试次数" prop="loginRetryTimes">
        <el-input v-model.number="form.loginRetryTimes" :min="1" :max="10">
          <template #append>次数</template>
        </el-input>
      </el-form-item>
      <el-form-item label="任务重新开始尝试等待时间" prop="taskRetryWaitSeconds">
        <el-input v-model.number="form.taskRetryWaitSeconds" :min="1" :max="10">
          <template #append>秒</template>
        </el-input>
      </el-form-item>
      <el-form-item label="获取开始时间相对当日往前偏移" prop="firstRequestOffsetDays">
        <el-input v-model.number="form.firstRequestOffsetDays" :min="1" :max="10">
          <template #append>天</template>
        </el-input>
      </el-form-item>
    </el-form>

  <el-popconfirm
    confirm-button-text="确定"
    cancel-button-text="取消"
    icon-color="#626AEF"
    title="确认回退吗？"
    @confirm="defaultSetting"
    @cancel="cancelEvent"
  >
    <template #reference>
      <el-button  :disabled="form.version=='1.0'">回退到默认设置</el-button>
    </template>
  </el-popconfirm>

  <el-popconfirm
    confirm-button-text="确定"
    cancel-button-text="取消"
    icon-color="#626AEF"
    title="确认修改吗？"
    @confirm="submitForm"
    @cancel="cancelEvent"
  >
    <template #reference>
      <el-button type="primary">修改</el-button>
    </template>
  </el-popconfirm>
</template>

<style scoped>
.my-header {
  margin-bottom: 20px;
}
span {
  font-size: 16px;
  color: #0a0a0a;
}
.version-text {
  margin-left: 20px;
}
.el-input {
  width: 50%;
}
</style>


