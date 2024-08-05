
<script> export default { 
  data() { 
    return {
  form: { 
    name: '',
   mnCode:'' 
}, 
 siteData: [] // 保存所有站点名和设备编号的数据 }; 
},
 
  mounted() { 
    this.loadAllSites();

   },
   
  methods: { 
    
 
 loadAllSites() {
   this.$http.get('/dust/sitename').then((response) => { 
  this.siteData = response.data.data; 
}); 

}, 
 
 onSiteNameSelected(siteName) { 

  const selectedSite = this.siteData.find((site) => site.siteName === siteName); 

  if (selectedSite) { 
    this.form.mnCode = selectedSite.mnCode; 
  }
  // 如果没有找到对应的设备编号，清空mnCode 
   else
   { this.form.mnCode = ''; 


} }
} ,
 watch: { 
  'form.name'(newValue) {
     this.onSiteNameSelected(newValue); 
    } } }

}
}

