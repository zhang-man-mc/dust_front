<!-- 多选框显示店铺名称 
返回父组件已选择的店铺

-->
<script>
import axiosInstance from '../utils/request.js'
export default {
emits:['submitShops'],
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      selectedShopName: [],
      shopNames: []
    };
  },
  mounted(){
    this.getAllShopNames()
  },
  methods: {
    getAllShopNames(){
            axiosInstance.get('/fume/shopnamepy').then(response =>{
                 response.data.data.forEach(item => {
                    this.shopNames.push(item.diName)
                 }
                 );
            })
        },
    handleCheckAllChange(val) {
      this.selectedShopName = val ? this.shopNames : [];
      this.isIndeterminate = false;
      this.$emit('submitShops',this.selectedShopName)
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.shopNames.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.shopNames.length;
        this.$emit('submitShops',this.selectedShopName)
    }
  }
};
</script>

<template>
  <div>
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
      
      >全选</el-checkbox
    >
    <el-checkbox-group
      v-model="selectedShopName"
      @change="handleCheckedCitiesChange"
    >
      <el-checkbox v-for="shop in shopNames" :key="shop" :label="shop"
        >{{ shop }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>


