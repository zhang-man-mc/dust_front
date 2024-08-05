import { createApp } from 'vue'
import Cookie from 'js-cookie'
import App from './App.vue'
import router from './router'

import "@/style/index.css"
import axios from 'axios'
import { ElMessage } from 'element-plus'
// 全局引入样式
import 'element-plus/theme-chalk/src/index.scss'
import { createPinia } from 'pinia'

import {url} from '@/api/index.js'

const app = createApp(App)
const pinia = createPinia()

router.beforeEach((to,from,next)=>{
  const token = Cookie.get('token')
  if(!token && to.name!='login'){
    next({name:'login'}) 
  }
  // token存在，但用户切换的是登录页面时，返回默认主界面
  else if(token && to.name =='login'){
    next({name:'edata'}) 
  }else{
    next()
  }
})


// 部署
axios.defaults.baseURL = url

app.config.globalProperties.$http = axios

app.use(ElMessage)
app.config.globalProperties.$message = ElMessage
app.use(router)
app.use(pinia)

app.mount('#app')
