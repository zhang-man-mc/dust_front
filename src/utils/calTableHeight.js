export function useTableHeight(top=0,pagination =0,h3=0,h4=0,h5=0){
    const tableHeight = ref(0)
    tableHeight.value = 300
    tableHeight.value = `calc(100vh - ${top}px - ${pagination}px - ${h3}px - ${h4}px - ${h5}px - 45px)`
    
    return tableHeight
}