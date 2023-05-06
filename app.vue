<script setup lang="ts">
const story = await useAsyncStoryblok("home", {
  version: "draft",
});

console.log(story.value);
</script>

<template>
  <!-- <NuxtLayout>
    <NuxtPage />
    <pre>{{ story }}</pre>
  </NuxtLayout> -->
  <Header />
  <pre>{{ story }}</pre>
</template>
