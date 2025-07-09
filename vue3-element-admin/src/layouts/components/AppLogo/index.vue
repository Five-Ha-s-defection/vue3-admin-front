<template>
  <!-- <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link v-if="!isCollapse" :key="+collapse" class="wh-full flex-center" to="/">
        <img :src="logo" class="w20px h20px" style="width: 140px; height: 40px" />
      </router-link>
    </transition>
  </div> -->
  <div class="logo-box" :class="collapse ? 'logo-mini' : 'logo-full'">
    <router-link :key="+collapse" class="wh-full flex-center" to="/">
      <img :src="logo" class="logo-img" />
    </router-link>
  </div>
</template>

<script lang="ts" setup>
const logo = "https://crm.feelec.com.cn/Public/img/feelCrm.png";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;

  .title {
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: $sidebar-logo-text-color;
  }
}
</style>

<style lang="scss" scoped>
.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;
  transition: all 0.3s;
  .logo-img {
    transition: all 0.3s;
  }
  .logo-text {
    margin-left: 10px;
    font-size: 20px;
    font-weight: bold;
    color: $sidebar-logo-text-color;
    transition: all 0.3s;
  }
}
.logo-mini {
  padding: 0;
  .logo-img {
    width: 32px;
    height: 32px;
  }
  .logo-text {
    display: none;
  }
}
.logo-full {
  padding: 12px 23px 12px 12px;
  .logo-img {
    width: 110px;
    height: 23px;
  }
  .logo-text {
    display: inline-block;
    font-size: 20px;
  }
}
</style>
