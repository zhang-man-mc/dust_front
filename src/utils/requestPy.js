import axios from 'axios'

const baseUrl = 'http://127.0.0.1:5000' // 基础URL

const axiosInstancePy = axios.create({
  baseURL: baseUrl
})

export default axiosInstancePy