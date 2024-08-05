<!-- 
  远程搜索 站点名称 输入框组件
  根据输入站点的内容提供对应的输入建议
  1.向父组件传入站点名字 和 设备编码
  2.可以选择建议或者任意输入
  3.父组件可以设置输入框有无默认的站点名称
  4.父组件可以设置是否需要根据选中的异常类型来给出站点建议
  ** 
  在父组件中设置
  <InputSearch :isNeedDefaultSite="1" @submit-value="(n)=>form.name=n"> </InputSearch>

  父组件通过注入 :isNeedDefaultSite="1"或  :isNeedDefaultSite="0"来代表该输入框有无默认的站点名称
  1代表需要默认值 ，0代表不需要默认值
 -->

<script>
import exceptionApi from '@/api/exceptionApi.js'
export default {
  props: {
    // 0代表不需要默认值，1代表需要默认值
    isNeedDefaultSite: {
      type: String,
      default: '0'
    },
    // 0代表不需要，1代表根据时段和异常来给出输入建议
    isNeedRealTimeAdvice: {
      type: String,
      default: '0'
    },
    exceptionType: {
      type: Array,
      default: () => {
        return []
      }
    },
    beginTime: {
      type: String,
      default: ''
    },
    endTime: {
      type: String,
      default: ''
    },
    siteName: {
      type: String,
      default: '-1'
    }
  },
  emits: ['submitValue', 'submitSiteNums', 'submitMncode'],
  data() {
    return {
      // 用户选中的值
      state: '',
      // 保存输入建议的站点名称
      siteNames: [],
      // 保存输入建议的站点设备编号
      siteNamesAndMnCode: []
    }
  },
  watch: {
    beginTime(val, oldVal) {
      if (this.isNeedRealTimeAdvice == '1' && oldVal != '') {
        exceptionApi
          .getExceptionName(this.exceptionType, this.beginTime, this.endTime)
          .then((res) => {
            this.siteNames = []
            const sites = res.data.data
            sites.filter((item) => {
              this.siteNames.push(item['name'])
            })
          })
      }
    },
    exceptionType() {
      if (this.isNeedRealTimeAdvice == '1') {
        exceptionApi
          .getExceptionName(this.exceptionType, this.beginTime, this.endTime)
          .then((res) => {
            this.siteNames = []
            const sites = res.data.data
            sites.filter((item) => {
              this.siteNames.push(item['name'])
            })
          })
      }
    },
    siteName() {
      if (this.siteName != '-1' && this.siteName != '') {
        this.state = this.siteName
        this.$emit('submitValue', this.state)
      }
    },
    state() {
      if (this.state != '' && this.state != null) {
        // 查找对应的设备编号
        this.onSiteNameSelected(this.state)
      }
    }
  },
  mounted() {
    // 加载所有的站点名称
    this.loadAll()
    if (this.isNeedDefaultSite == 1) {
      this.state = '金山区金山新城JSC1-0401单元1-11-01地块项目09'
      this.$emit('submitValue', this.state)
    } else if (this.isNeedDefaultSite == 0) {
      this.state = ''
      this.$emit('submitValue', this.state)
    }
  },
  methods: {
    obscureMatch(a, b) {
      const pattern = new RegExp(a, 'i')
      // 'i' 表示不区分大小写
      return pattern.test(b)
    },

    querySearch(queryString, cb) {
      const results = queryString
        ? this.siteNames.filter(this.createFilter(queryString))
        : this.siteNames
      cb(results)
    },

    createFilter(queryString) {
      return (restaurant) => {
        return (
          this.obscureMatch(queryString,restaurant)
        )
      }
    },
    // 初始化加载所有的站点名字
    loadAll() {
      if (this.isNeedRealTimeAdvice == '1') {
        exceptionApi
          .getExceptionName(this.exceptionType, this.beginTime, this.endTime)
          .then((res) => {
            this.siteNames = []
            const sites = res.data.data
            sites.filter((item) => {
              this.siteNames.push(item['name'])
              let temp = {}
              temp.name = item.name
              temp.mnCode = item.mnCode
              this.siteNamesAndMnCode.push(temp)
            })
          })
      } else if (this.isNeedRealTimeAdvice == '0') {
        exceptionApi.getSitesNum().then((response) => {
          const sites = response.data.data
          sites.filter((item) => {
            this.siteNames.push(item['name'])
            let temp = {}
            temp.name = item.name
            temp.mnCode = item.mnCode
            this.siteNamesAndMnCode.push(temp)
          })
          this.$emit('submitSiteNums', this.siteNames.length)
        })
      }
    },
    // 根据选中的站点查询设备编号
    onSiteNameSelected(siteName) {
      const selectedSite = this.siteNamesAndMnCode.find((site) => site.name == siteName)
      if (selectedSite) {
        this.$emit('submitMncode', selectedSite.mnCode)
      } else {
        this.$emit('submitMncode', '')
      }
    },

    // 点击选中建议项时触发
    handleSelect(item) {
      this.state = item
      this.$emit('submitValue', this.state)
    },
    // 在点击由 clearable 属性生成的清空按钮时触发
    clearSiteName() {
      this.state = ''
      this.$emit('submitValue', this.state)
    },
  
  }
}
</script>

<template>
  <div class="container">
    <span class="text">点位名称：</span>
    <el-autocomplete
      v-model="state"
      :fetch-suggestions="querySearch"
      popper-class="my-autocomplete"
      placeholder="请输入"
      @select="handleSelect"
      @change="handleSelect"
      clearable
      @clear="clearSiteName"
    >
      <template #default="{ item }">
        <div class="value">{{ item }}</div>
      </template>
    </el-autocomplete>
  </div>
</template>

<style>
.container {
  display: flex;
}

.text {
  font-weight: bold;
  font-size: 14px;
  color: #333333;
}
.el-autocomplete {
  width: 200px;
}
</style>
