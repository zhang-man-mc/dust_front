<script>
import TimeSelectWithShortCuts from '@/sfc/TimeSelectWithShortCuts.vue'
import settingApi from '@/api/data_access_setting/settingApi.js'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

export default {
  components: {
    TimeSelectWithShortCuts
  },
  data() {
    return {
      // 区域
      radio: 0,
      // 定时
      radio1: '',
      beginTime: '',
      endTime: '',

    }
  },
  mounted() {
    // this.get()
    // this.getAll()
    console.log('时间',new Date().getMilliseconds()); 
  },
  methods: {
    giveTime(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
    },
    set() {
      const params = {}
      params.user = 'admin'
      params.beginTime = this.beginTime
      params.endTime = this.endTime
      params.region = '金山'
      params.isRegularTime = this.radio1
      settingApi.submitSetting(params).then((res) => {
        if (res.data.code == 1) {
          ElMessage.success('设置成功')
        } else {
          ElMessage('设置失败')
        }
      })
    },
  
  }
}
</script>

<template>
  <el-card> 
  <el-form>
    <div>生成配置文件</div>
    <el-form-item label="区域：">
      <el-radio-group v-model="radio">
        <el-radio :label="0">金山</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <TimeSelectWithShortCuts @submit-time="giveTime"></TimeSelectWithShortCuts>
    </el-form-item>

    <el-form-item label="是否定时：">
      <el-radio-group v-model="radio1">
        <el-radio label="1" size="large">是</el-radio>
        <el-radio label="2" size="large">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item> <el-button type="success" @click="set">设置</el-button></el-form-item>
  </el-form>
  <correct theme="outline" size="24" fill="#333"/>

</el-card>
</template>

<style scoped>
.el-card {
  margin: 10px;
}
div {
  margin-bottom: 10px;
  color: #333333;
}
:deep(.el-form-item__label) {
  font-weight: bold;
  font-size: 16px;
  color: #333333;
}
</style>
