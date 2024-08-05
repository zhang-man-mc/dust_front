<!-- 运维商类型

    **父组件
    <DutyCompany @submitDutyCompanyValue="(n)=>(form.dutyCompany = n)"> </DutyCompany>
-->
<script>
import siteInfo from '@/api/site/siteInfo.js'
export default {
  emits: ['submitDutyCompanyValue'],

  data() {
    return {
      // 已选择的运维商
      dutyCompany: [],
      // 运维商列表
      optionDutyCompany: []
    }
  },
  mounted() {
    // 查询所有的运维商
    this.fetchDustCompany()
  },
  methods: {
    /**
     * 查询所有的运维商
     * @param：
     */
    fetchDustCompany() {
      siteInfo.queryDutyCompany().then((response) => {
        response.data.data.forEach((item) => {
          this.optionDutyCompany.push(item.dutyCompany)
        })
      })
    }
  }
}
</script>

<template>
  <div class="container">
    <div>
      <el-text class="text">运维商：</el-text>
      <el-select
        v-model="dutyCompany"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="1"
        placeholder="全部"
        :loading="loading"
        @change="$emit('submitDutyCompanyValue', this.dutyCompany)"
      >
        <el-option v-for="item in optionDutyCompany" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.el-select {
  width: 150px;
}
.container {
  display: flex;
}

.text {
  color: #333333;
  font-size: 14px;
}
</style>
