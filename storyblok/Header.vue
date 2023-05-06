<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    required: true,
  },
});
</script>
<template>
  <header class="w-full h-24 bg-[#f7f6fd]" v-editable="blok">
    <div class="container h-full mx-auto flex items-center justify-between">
      <nav>
        <ul>
          <!-- <li v-for="navItem in blok.navItems">{{ navItem.text }}</li> -->
        </ul>
      </nav>
    </div>
  </header>
</template>
