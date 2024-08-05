<!-- 街镇类型

    **父组件
    <AreaAndmonitorType ></AreaAndmonitorType>
-->
<script>
import siteInfo from '@/api/site/siteInfo.js'
export default {
  emits: ['submitStreetValue'],

  data() {
    return {
      // 已选街道
      street: [],
      // 运维商列表
      optionStreet: [],
      loading:false
    }
  },
  mounted() {
    // 查询所有的运维商
    // this.fetchStreetInfo()
  },
  methods: {
    /**
     * 查询所有的运维商
     * @param：
     */
    fetchStreetInfo(streetName) {
      if (streetName) {
        this.loading = true
        siteInfo.queryStreet(streetName).then((response) => {
        response.data.data.forEach((item) => {
          this.optionStreet.push(item.address)
        })
        this.loading = false
      })

      } else {
        this.optionStreet = []
      }
     
    }
  }
}
</script>

<template>
  <div class="container">
    <div>
      <el-text class="text">街镇：</el-text>
      <el-select
        v-model="street"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="请输入街镇"
        remote-show-suffix
        collapse-tags
        collapse-tags-tooltip
         :max-collapse-tags="1"
        :remote-method="fetchStreetInfo"
        :loading="loading"
         @change="$emit('submitStreetValue', this.street)"
      >
        <el-option
          v-for="item in optionStreet"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.el-select {
  width: 170px;
}
.container {
  display: flex;
}

.text {
  color: #333333;
  font-size: 14px;
}
</style>
