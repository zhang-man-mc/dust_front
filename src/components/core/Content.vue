<template>
    <router-view v-slot="{ Component, route }">
      <!-- <transition :name="route.meta.transition || 'fade'"> -->
      <keep-alive>
        <component
          v-if="route.meta.keepAlive"
          :is="Component"
          :key="route.name"
        />
      </keep-alive>
      <component v-if="!route.meta.keepAlive" :is="Component" :key="route.name" />
      <!-- </transition> -->
    </router-view>
  </template>
  
  <script>
  export default {
    name: 'CoreContent',
  };
  </script>
  <style scoped></style>
  