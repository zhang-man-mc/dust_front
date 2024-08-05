<script>
import exceptionSetting from '@/api/setting/exceptionSetting.js'
import { useCommonFunction } from '@/utils/common.js'
export default {
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

        missDataMinutes: this.form.missDataMinutes,
        dataLow: this.form.dataLow,
        longTimeNoChange: this.form.longTimeNoChange,
        mutationNum: this.form.mutationNum,
        mutationRate: this.form.mutationRate,
        nearExceedLowValue: this.form.nearExceedLowValue,
        nearExceedHighValue: this.form.nearExceedHighValue,
        nearExceedNum: this.form.nearExceedNum,
        dayExceedBorderlineLowNum: this.form.dayExceedBorderlineLowNum,
        dayExceedBorderlineHighNum: this.form.dayExceedBorderlineHighNum,
        changeTrendGroup: this.form.changeTrendGroup,
        changeTrendInterval: this.form.changeTrendInterval,
        changeTrendRate: this.form.changeTrendRate,
        changeTrendTimes: this.form.changeTrendTimes,
        exceedingStandard: this.form.exceedingStandard
      }
    }
  },
  watch: {
    formData: {
      handler() {
        if (Object.keys(this.formData).length != 0)
          this.form = JSON.parse(JSON.stringify(this.formData))
      },
      deep: true
    }
  },
  data() {
    return {
      form: {},
      // 最高的版本号
      maxVersion: null,
      loading: false,
      // 修改状态
      modify: false
    }
  },
  setup() {
    const { findMaxValue } = useCommonFunction()
    return { findMaxValue }
  },
  mounted() {
    this.queryException()
  },

  methods: {
    // 提交
    async submitForm() {
      // 发送修改的请求
      await exceptionSetting.submitExceptionSetting(this.formDataAfterCal)

      this.$message.success('提交成功')

      // 数据提交后刷新表单
      this.queryException()
    },

    /**
     * 回退到默认配置
     * @param：
     * @returns：
     */
    async defaultSetting() {
      if (this.form.version == '1.0') {
        this.$message.info('当前已经是默认的版本')
        return
      }
      this.loading = true
      await exceptionSetting.queryDefaultSetting().then((Response) => {
        this.form = {}
        this.form = Response.data.data[0]
      })

      this.modify = true
      // 设置版本1.0 的更新时间
      exceptionSetting.alertExceptionSetting(this.formDataAfterCal)
      this.modify = false
      this.loading = false

      this.$message.success('回退成功')
    },

    /**
     * 查询请求设置的数据
     * @param：
     * @returns：
     */
    queryException() {
      this.loading = true
      exceptionSetting.queryExceptionSetting().then((Response) => {
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
  <el-form :model="form" label-width="230px" v-loading="loading">
    <el-form-item label="用户名">
      <el-input :value="userName" disabled />
    </el-form-item>

    <el-form-item label="区县">
      <el-input :value="form.region" disabled />
    </el-form-item>

    <el-form-item label="(数据缺失)缺失的分钟数">
      <el-input v-model.number="form.missDataMinutes">
        <template #append>分钟</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(数据超低)颗粒物浓度值小于X">
      <el-input v-model="form.dataLow">
        <template #append>mg/m³</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(数据长时间无波动)连续X个值相等">
      <el-input v-model.number="form.longTimeNoChange">
        <template #append>个</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(量级突变)连续N个15分钟">
      <el-input v-model.number="form.mutationNum">
        <template #append>分钟</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(量级突变)变化率超过X">
      <el-input v-model="form.mutationRate">
        <template #append>比率</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(临近超标异常)处于[a,b]的左边界">
      <el-input v-model="form.nearExceedLowValue">
        <template #append>mg/m³</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(临近超标)处于[a,b]的右边界">
      <el-input v-model="form.nearExceedHighValue">
        <template #append>mg/m³</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(临近超标)次数超过X个">
      <el-input v-model.number="form.nearExceedNum">
        <template #append>次</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(单日超标次数临界)超标次数达X次">
      <el-input v-model.number="form.dayExceedBorderlineLowNum">
        <template #append>次</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(单日超标次数临界)但未达到Y次">
      <el-input v-model.number="form.dayExceedBorderlineHighNum">
        <template #append>次</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(变化趋势异常)N个一组">
      <el-input v-model.number="form.changeTrendGroup">
        <template #append>个</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(变化趋势异常)间隔M">
      <el-input v-model.number="form.changeTrendInterval">
        <template #append>个</template>
      </el-input>
    </el-form-item>
    <el-form-item label="(变化趋势异常)平均值相差Y">
      <el-input v-model="form.changeTrendRate">
        <template #append>mg/m³</template>
      </el-input>
    </el-form-item>

    <el-form-item label="(变化趋势异常)连续的次数">
      <el-input v-model.number="form.changeTrendTimes">
        <template #append>次</template>
      </el-input>
    </el-form-item>

    <el-form-item label="(超标)超过标准值">
      <el-input v-model="form.exceedingStandard">
        <template #append>mg/m³</template>
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
