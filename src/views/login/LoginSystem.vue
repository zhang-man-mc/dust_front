<template>
  <div class="login-container">
    <strong class="login-page-title"> 生态环境在线监测数据质量评估与风险分析系统 </strong>
    <el-card class="login-card">
      <h2>登陆</h2>
      <div class="box"><img src="../../assets/loginBg.png" class="imag" /></div>
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input
            class="login-input1"
            v-model="username"
            placeholder="请输入账号"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            placeholder="请输入密码"
            type="password"
            size="large"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="inputVal" class="code" placeholder="验证码"></el-input>
          <ValidateCode ref="ref_validateCode" @change="changeCode" />
        </el-form-item>
        <!-- <el-button @click="compare">比对</el-button> -->
      </el-form>
      <el-checkbox label="记住密码" v-model="isRemember" class="login-input2"></el-checkbox>
      <div>
        <el-button color="#3d86d5" class="login-btn" @click="login" size="large">登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import Cookie from 'js-cookie'
import ValidateCode from '@/sfc/ValidateCode.vue'
import loginApi from '@/api/loginApi.js'
import { useLoginUserStore } from '@/stores/user'
export default {
  components: {
    ValidateCode
  },
  data() {
    return {
      username: '',
      password: '',
      // 验证码输入值
      inputVal: '',
      // 是否记住密码
      isRemember: false,

      // 验证码
      checkCode: '',
      // 对比结果
      result: ''
    }
  },
setup(){
  const user = useLoginUserStore()
  return {user}
},
  mounted() {
    this.getAccount()
  },
  methods: {
    login() {
      if (this.compare()) {
        // 判断是否勾选记住密码
        this.hasRemember()
        // loginApi.login(this.username, md5(this.password)).then((res) => {
        loginApi.login(this.username, this.password).then((res) => {
          if (res.data.code == 1) {
            ElMessage.success('登录成功')
            const token = 'abc'
            Cookie.set('token', token)

            // 输入的用户名保存在pinia中,并且存入浏览器本地
            this.user.currentLoginUser = res.data.data
            
            localStorage.setItem('currentUserName',res.data.data)
            // 登录成功，跳转到对应页面
            this.$router.push('/edata') // 假设登录成功后跳转到 '/dashboard' 页面
            // 保存token
          } else if (res.data.code == 0) {
            ElMessage(res.data.msg)
          }
        })
      } else {
        ElMessage('验证码输入错误')
      }
    },

    changeCode(value) {
      this.checkCode = value
    },

    // 对比验证码
    compare() {
      if (this.inputVal.toUpperCase() === this.checkCode) {
        this.result = '比对成功'
        return true
      } else {
        this.result = '比对失败,请重新输入'
        this.inputVal = ''
        this.$refs['ref_validateCode'].draw()
        return false
      }
    },
    //  检查本地存储是否有记住的账号密码，如果有则填充到输入框中
    getAccount() {
      const savedUsername = localStorage.getItem('username')
      const savedPassword = localStorage.getItem('password')
      if (savedUsername && savedPassword) {
        this.username = savedUsername
        this.password = savedPassword
        this.isRemember = true
        
      }
    },
    // 判断是否勾选记住密码
    hasRemember() {
      if (this.isRemember) {
        // 保存账号密码到本地存储
        localStorage.setItem('username', this.username)
        localStorage.setItem('password', this.password)
      } else {
        // 清除本地存储的账号密码
        localStorage.removeItem('username')
        localStorage.removeItem('password')
      }
    }
  }
}
</script>

<style scoped>
.login-page-title {
  font-size: 40px;
  color: white;
  position: absolute;
  top: 10vh;
  left: 15vw;
  letter-spacing: 10px;
}

.login-container {
  background-image: url('../../assets/loginPageBg.png');
  /*用于为一个元素设置一个或者多个背景图像。 */
  background-size: cover; /* 将背景图像等比缩放到完全覆盖容器，背景图像有可能超出容器。*/
  background-position: center; /* 为每一个背景图片设置初始位置。这个位置是相对于由 background-origin 定义的位置图层的 键字 center，用来居中背景图片。*/

  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center; /*center：伸缩元素向每行中点排列 */
  align-items: center; /*素在交叉轴居中。如果元素在交叉轴上的高度高于其容器，那么在两个方向上溢出距离相同 */

  position: relative;
}
.login-card {
  background-color: white;
  margin: 0 auto;
  padding: 20px;
  /* border-radius: 12px; */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 0;
  border-radius: 8px;
  position: absolute;
  right: 10%;
  top: 22%;
  width: 350px;
  height: 500px;
}
.el-input {
  border-radius: 10px;
}
.login-input2 {
  margin-bottom: 30px;
}
.box {
  width: 120px;
  height: 120px;

  position: absolute;
  top: 10px;
  right: 10px;
}
.imag {
  max-width: 100%;
  max-height: 100%;
}
.el-card h2 {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}
:deep(.el-form-item__label) {
  color: black;
}

.login-btn {
  /* position: absolute;
  width: calc(100% - 150px);
  font-size: 1.1em;
  letter-spacing: 0.3em;
  text-align: center;
  box-sizing: border-box;
  bottom: 10px; */
  width: 100%;
  font-size: 1.1em;
  letter-spacing: 0.3em;
}

.code {
  width: 50%;
}
:deep(.el-input__inner) {
  height: 40px;
}




/* 设置断点  媒体查询 */
@media screen and (max-width: 1366px) {
/* 笔记本屏幕宽度小于 1366px */
/* 样式代码 */
.login-page-title {
  font-size: 30px;
  color: white;
  position: absolute;
  top: 10vh;
  left: 15vw;
  letter-spacing: 10px;
}

.login-card {
  background-color: white;
  margin: 0 auto;
  padding: 20px;
  /* border-radius: 12px; */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 0;
  border-radius: 8px;
  position: absolute;
  right: 3%;
  top: 25%;

  width: 320px;
  height: 500px;
}
.login-container {
  background-image: url('../../assets/loginPageBg.png');
  /*用于为一个元素设置一个或者多个背景图像。 */
  background-size: vocer; /* 将背景图像等比缩放到完全覆盖容器，背景图像有可能超出容器。*/
  background-position: center; /* 为每一个背景图片设置初始位置。这个位置是相对于由 background-origin 定义的位置图层的 键字 center，用来居中背景图片。*/
}
}

@media (max-width: 480px) {
/* 平板横屏屏幕宽度小于 480px */
/* 样式代码 */
.login-page-title {
  font-size: 25px;
  color: white;
  position: absolute;
  top: 10vh;
  left: 15vw;
  letter-spacing: 5px;
}
.login-card {
  background-color: white;
  margin: 0 auto;
  padding: 20px;
  /* border-radius: 12px; */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 0;
  border-radius: 8px;
  position: absolute;
  right: 8%;
  top: 25%;

  width: 320px;
  height: 450px;
}
}
/*  */
</style>
