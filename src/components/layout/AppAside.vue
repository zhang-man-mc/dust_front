<script>
import { isCollapse } from './isCollapse';

export default {
  data() {
    return {
      menuHeight: '600px',
      isCollapseAside: isCollapse,
      // 图标颜色切换
      menu:[ { avalue:true},{ avalue:true},{ avalue:true},{ avalue:true},{ avalue:true},{ avalue:true},{ avalue:true}]
       
      
    };
  },
  methods:{
    calMenuHeight() {
      const h1 = this.$refs.headerRef.$el.offsetHeight;
      return `calc(100vh - ${h1}px - 8px`;
    },
    changeIcon(i){
      this.menu[i].avalue = !this.menu[i].avalue

      // 其他的置为默认状态
      for(let j = 0;j<this.menu.length;j++){
        if( j!=i){
          // 开始时显示的是未选中状态
          this.menu[j].avalue = true
        }
      }
    }
  },
  mounted(){
    this.menuHeight = this.calMenuHeight();
  }
};
</script>

<template>
  <el-aside>
      <el-menu
        active-text-color="#F7BA1E"
        background-color="#2876aa"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#fff"
        router
        :collapse="isCollapseAside"
      >
      <el-row ref="headerRef" class="header">
        <el-link href="/hdata" class="logo" >
          <div class="title-text">
          <div  class="title-text-one">数据质量评估</div>
          <div  class="title-text-one">与风险分析系统</div>
        </div>
        </el-link>
       </el-row>

      <div class="horizontal-line"></div>
        <el-scrollbar :height="menuHeight">

        <el-sub-menu index="1">
          <template #title>
            <img src="@/assets/risk.png" height="23">
            <span class="parent-title">风险评估</span>
          </template>
          <!-- 未选中 -->
          <el-menu-item index="/avgDay" v-show="menu[0].avalue" @click="changeIcon(0)" >
            <img src="@/assets/generalModel.png" height="23">
            数据风险模型
          </el-menu-item>
          <!-- 灰的 -->
          <el-menu-item index="/avgDay"  v-show="!menu[0].avalue" @click="changeIcon(0)">
            <img src="@/assets/generalModel2.png" height="23">
            数据风险模型
          </el-menu-item>

          <el-menu-item index="/riskrank"  v-show="menu[2].avalue" @click="changeIcon(2)">
            <img src="@/assets/generalModel.png" height="23">
            数据风险排名
          </el-menu-item>
          <el-menu-item index="/riskrank"  v-show="!menu[2].avalue" @click="changeIcon(2)">
            <img src="@/assets/generalModel2.png" height="23">
            数据风险排名
          </el-menu-item>

          <el-menu-item index="/analysis" v-show="menu[1].avalue" @click="changeIcon(1)">
            <img src="@/assets/generalModel.png" height="23">
            数据指标排名
          </el-menu-item>
          <el-menu-item index="/analysis" v-show="!menu[1].avalue" @click="changeIcon(1)">
            <img src="@/assets/generalModel2.png" height="23">
            数据指标排名
          </el-menu-item>
        </el-sub-menu>


        <el-sub-menu index="2">
          <template #title>
            <img src="@/assets/onlineInspection.png" height="23">
            <span class="parent-title">线上巡检</span>
          </template>
          <el-menu-item index="/edata" v-show="menu[3].avalue" @click="changeIcon(3)">
            <img src="@/assets/generalModel.png" height="23">
          飞行巡检
          </el-menu-item>
          <el-menu-item index="/edata" v-show="!menu[3].avalue" @click="changeIcon(32)">
            <img src="@/assets/generalModel2.png" height="23">
          飞行巡检
          </el-menu-item>


          <el-menu-item index="/testData" v-show="menu[4].avalue" @click="changeIcon(4)">
            <img src="@/assets/generalModel.png" height="23">
          站点审核辅助
          </el-menu-item>
          <el-menu-item index="/testData" v-show="!menu[4].avalue" @click="changeIcon(4)">
            <img src="@/assets/generalModel2.png" height="23">
          站点审核辅助
          </el-menu-item>

        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <img src="@/assets/dataManagement.png" height="23">
            <span class="parent-title">数据管理</span>
          </template>
 
         
            <el-menu-item index="/hdata" v-show="menu[5].avalue" @click="changeIcon(5)">
            <img src="@/assets/generalModel.png" height="23">
          历史数据管理
          </el-menu-item>
          <el-menu-item index="/hdata" v-show="!menu[5].avalue" @click="changeIcon(5)" >
            <img src="@/assets/generalModel2.png" height="23">
          历史数据管理
          </el-menu-item>

         <el-menu-item index="/config" v-show="menu[6].avalue" @click="changeIcon(6)">
          <img src="@/assets/generalModel.png" height="23">
            参数配置
          </el-menu-item>
          
          <el-menu-item index="/config" v-show="!menu[6].avalue" @click="changeIcon(6)">
            <img src="@/assets/generalModel2.png" height="23">
            参数配置
          </el-menu-item>

          
          <!-- <el-menu-item index="report" >
            <el-icon><i-ep-Histogram /></el-icon>
          业务报表
          </el-menu-item> -->

          </el-sub-menu>

          <!-- <el-sub-menu index="4">
              <template #title>
                <img src="@/assets/configurationManagement.png" height="23">
                  <span class="parent-title">配置管理</span>
              </template>

              <el-menu-item index="setting" v-show="menu[6].avalue" @click="changeIcon(6)">
                <img src="@/assets/generalModel.png" height="23">
                   数据接入配置
              </el-menu-item>
              <el-menu-item index="setting" v-show="!menu[6].avalue" @click="changeIcon(6)">
                <img src="@/assets/generalModel2.png" height="23">
                   数据接入配置
              </el-menu-item>
              
          </el-sub-menu> -->
          
    </el-scrollbar>
      </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
.el-aside {
  background-color: #2876aa;
  height: 100vh;
  width: auto;
}

.el-menu {
  background-color: #2876aa;

  width: 220px;
  border-right: none;
  &.el-menu--collapse {
    /* //侧边栏折叠时的样式 */
    width: 65px;
    & .title-text {
      /* //折叠时隐藏h1文字 */
      display: none;
    }
    & span {
      display: none;
    }
    & hr {
      display: none;
    }
  }
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  text-decoration: none;
  color: black;
  margin-left: 40px;
  margin-right: 20px;
  font-size:16px
}


* {
  color:  #f7f8fa;
}
.slot-lable {
  color: #f7f8fa;
}
.parent-title {
  font-weight: bold;
  font-size: 16px;
}

img {
  margin-right: 6px;
}
.el-menu-item {
  font-size: 16px;
}
.hr {
  color: rgb(0,0,0);
}
.title-text{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.horizontal-line {
  position: relative;
  height: 1px;
}
.horizontal-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgb(221, 217, 217,0.2);
  /* // width: 180px; */
}
</style>
