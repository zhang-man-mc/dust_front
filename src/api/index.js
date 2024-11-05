import axios from 'axios'
import { setInterceptors } from './config'

// 本机测试
const url =  (import.meta.env.DEV == true) ? 'http://localhost:7861/':'http://117.72.109.0:7861'


//飞羽监管
const $http = axios.create({
  baseURL: url,
  timeout: 10000
})

/* Python后台 */
const url_py = 'http://127.0.0.1:8089/'
const $http_py = axios.create({
  baseURL: url_py,
  timeout: 10000
})

//添加拦截器
setInterceptors($http, $http_py)

export { $http, $http_py, url }
