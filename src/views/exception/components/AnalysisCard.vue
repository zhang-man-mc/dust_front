<!-- 异常分析卡片 -->
<script>
import DustExceptionText from './DustExceptionText.vue'
import NoDataStatus from './NoDataStatus.vue'
import dayjs from 'dayjs'
export default {
  props: {
    // 异常的站点名称
    siteName: {
      type: Array,
      default: () => {
        return ['站点1', '站点2']
      }
    },
    // 异常类型
    exceptionType: {
      type: String,
      default: '0'
    },
    // 开始时间
    beginTime: {
      type: String,
      default: '2023-09-11 00:00:00'
    },
    // 结束时间
    endTime: {
      type: String,
      default: '2023-09-15 00:00:00'
    },
    // 异常的名字
    exceptionName: {
      type: String,
      default: '异常'
    },
    // 图标地址
    icon: {
      type: String,
      default: '111'
    },
    // 异常站点数
    siteNum: {
      type: Number,
      default: 0
    },
    // 站点总数
    siteNumAll: {
      type: Number,
      default: 90
    },
    // 该异常在某段时间的数量
    exceptionNum: {
      type: Number,
      default: 10
    },
    // 所有异常在某段时间数量的累加和
    exceptionAllNum: {
      type: Number,
      default: 100
    },
    // 是否无数据
    isNoDataStatus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['getAbnormalDataByClick'],
  components: {
    DustExceptionText,
    NoDataStatus
  },
  data() {
    return {}
  },

  computed: {
    auditButton_1() {
      let today = dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00')
      if (this.beginTime >= today && this.isNoDataStatus == false) {
        return true
      }
      return false
    }
  },
  mounted() {},
  methods: {
    getAbnormalDataByClick(val) {
      this.$emit('getAbnormalDataByClick', val)
    },
    openDetail() {
      this.$router.push(`/AuditDetail/${this.beginTime}/${this.endTime}/${this.exceptionType}`)
    }
  }
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="icon-text">
        <!-- <slot/> -->
        <img :src="icon" height="24" width="24" />
        <div class="exception-name">{{ exceptionName }}</div>
        <el-button
          type="danger"
          size="small"
          class="audit-button"
          v-show="auditButton_1"
          @click="openDetail"
          >审核</el-button
        >
      </div>

      <div class="exception-num">
        <div>
          <span class="exception-num-text">异常站点占比</span>
          <span>{{ siteNum }}/{{ siteNumAll }}</span>
          <span> ({{ ((siteNum / siteNumAll) * 100).toFixed(1) }}%)</span>
        </div>

        <div>
          <span class="exception-num-text">异常数占比</span>
          <span>{{ ((exceptionNum / exceptionAllNum) * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </template>

    <div class="card-exception-buttom" v-show="!isNoDataStatus">
      <el-scrollbar max-height="190px">
        <DustExceptionText
          :site-name="item.name"
          :exception-type="exceptionType"
          :begin-time="beginTime"
          :end-time="endTime"
          @submit-exception-data="getAbnormalDataByClick"
          v-for="(item, index) in siteName"
          :key="item"
          >{{ item.name }}
          <span v-if="index < siteName.length - 1" class="text-blank">,</span>
        </DustExceptionText>
      </el-scrollbar>
    </div>
    <NoDataStatus :is-no-data="isNoDataStatus"></NoDataStatus>
  </el-card>
</template>

<style scoped>
.el-card {
  height: 300px;
}
.icon-text {
  display: flex;
  margin-bottom: 10px;
}
.audit-button {
  margin-left: auto;
}
.exception-name {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  letter-spacing: 3px;
}
.exception-num {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666666;
}
.exception-num-text {
  margin-right: 4px;
}
</style>
