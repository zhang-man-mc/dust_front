<script >
 import { isCollapse } from './isCollapse'
 import BreadCrumb from '@/sfc/BreadCrumb.vue'
 import Cookie from 'js-cookie'
  export default {
    components:{
      BreadCrumb,
    },
    data() {
      return{
        isCollapseHeader: isCollapse ,  //折叠

      }
    },
    mounted(){
     
  },
    methods: {
      handleCommand(command){
        if(command == 'a' ){
        Cookie.remove('token')
        this.$router.push('/login') 
        }
       
      }
     }
}
</script>

<template>
 
   <el-header>
        <!-- 图标 -->
        <!--  @click="isCollapseHeader = !isCollapseHeader" -->
      <el-icon class="clickable"  @click="isCollapseHeader = !isCollapseHeader" title="折叠">
        <i-ep-Expand v-show="isCollapseHeader" />
        <i-ep-Fold v-show="!isCollapseHeader"/>
      </el-icon>
      
    <!-- 面包屑 -->
    
      <BreadCrumb></BreadCrumb>

   <!-- 下拉菜单 -->
    <el-dropdown  @command="handleCommand">
        <span class="el-dropdown-link" >
          <el-avatar class="clickable" :size="50" :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />   
        <el-icon class="el-icon--right ">
            <i-ep-arrow-down />
        </el-icon>
        </span>
        <template #dropdown>
        <el-dropdown-menu>
            <el-dropdown-item command="a">退出</el-dropdown-item>
        </el-dropdown-menu>
        </template>
    </el-dropdown>

   </el-header>
</template>

<style lang="scss" scoped>
/* 可鼠标箭头变为可点击状态 */
.clickable {
  cursor: pointer;
}
.el-header {
    display: flex;
    align-items: center;
    color: white;
    background-color: #0093E9;
    background-image: linear-gradient(160deg, #2876aa 0%, #5cbfdd 100%);

.el-icon {
        margin-right: 17px;
    }
}

.el-dropdown {
    margin-left: auto;
    .el-dropdown-link {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>