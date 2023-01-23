<script setup lang="ts">
import gsap from "gsap";

onMounted(() => {
  gsap.to(".box", {
    duration: 2,
    x: "100%",
    y: 30,
  });
});
</script>

<template>
  <div class="bg-orange-200 h-screen">
    <div class="box bg-red-200 h-20 w-20"></div>
  </div>
</template>
