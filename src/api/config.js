import { ElMessage } from 'element-plus'

/**
 * 设置网路请求监听
 */
function setInterceptors(...instance) {
  instance.forEach((i) => {
    // 添加请求拦截器
    i.interceptors.request.use(
      function (config) {
        // 从localStorage中获取token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers['Authorization'] = token
        }
        // 在发送请求之前, 添加请求头
        // config.headers = addHeaders(config.headers);

        if (import.meta.env.DEV) {
          console.log('==>请求开始')
          console.log(`${config.baseURL}${config.url}`)
          if (config.data) {
            console.log('==>请求数据', config.data)
          }
        }
        return config
      },
      function (error) {
        // 对请求错误做些什么
        if (import.meta.env.DEV) {
          console.log('==>请求开始')
          console.log(error)
        }

        ElMessage({
          message: error,
          type: 'error'
        })
        return Promise.reject(error)
      }
    )

    // 添加响应拦截器
    i.interceptors.response.use(
      function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        if (import.meta.env.DEV) {
          console.log(response)
          console.log('==>请求结束')
        }

        if (response.status == 200) {
          if (response.data.success != undefined && response.data.success != null) {
            if (response.data.success == true) {
              return response.data.data
            } else {
              ElMessage({
                message: response.data.message,
                type: 'error'
              })
              return Promise.reject(response.data.message)
            }
          } else {
            return response
          }
        } else {
          return Promise.reject(response)
        }
      },
      function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        if (import.meta.env.DEV) {
          console.log(error)
          console.log('==>请求结束')
        }

        ElMessage({
          message: error,
          type: 'error'
        })
        return Promise.reject(error)
      }
    )
  })
}

export { setInterceptors }
