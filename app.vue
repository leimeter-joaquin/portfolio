<template>
  <AppHeader class="z-30" />
  <NuxtPage class="relative" />
  <AppFooter class="z-30" />
</template>

<style>
.page-left-enter-active,
.page-left-leave-active,
.page-right-enter-active,
.page-right-leave-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.6s ease-in-out;
}

.page-left-enter-from,
.page-right-leave-to {
  transform: translateX(100%);
}

.page-left-leave-to,
.page-right-enter-from {
  transform: translateX(-100%);
}

.page-left-enter-to,
.page-right-leave-to {
  transform: translateX(0);
}
</style>
