
<script>
  export default {
    props:{
    dialogVisible:{
        type:Boolean,
        default:false
    }
 },
    data() {
      return{
        // dialogVisible:false
        isOpen:false
      }
    },
    watch:{
        dialogVisible(){
            this.isOpen = this.dialogVisible
        }
    },
    mounted() {

    },
    methods: {

     }
}
</script>

<template>
    <el-dialog
    v-model="isOpen"
    width="80%"
  >
  11111
  </el-dialog>
</template>

<style  scoped>

</style>