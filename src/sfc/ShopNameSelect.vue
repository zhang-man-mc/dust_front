<!--下拉框显示店铺名称 
  可多选
返回父组件已选择的店铺
-->
<script >
import axiosInstance from '../utils/request.js'
  export default {
    emits:['submitShops'],
    data() {
      return{
        selectedShopNames:[],
        shopNames:[]
      }
    },
    mounted(){
        this.getAllShopNames()
    },
    methods: {
        getAllShopNames(){
            axiosInstance.get('/fume/device').then(response =>{
                 response.data.data.forEach(item => {
                    this.shopNames.push(item.diName)
                 }
                 );
            })
        }
     }

}
</script>

<template>
  <div>
    <el-select
      v-model="selectedShopNames"
      multiple
      placeholder="Select"
      style="width: 400px"
      @change="$emit('submitShops',this.selectedShopNames)"
    >
      <el-option
        v-for="item in shopNames"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>
