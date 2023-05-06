<script setup>
defineProps({
  blok: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div v-editable="blok">
    <StoryblokComponent v-for="blok in blok.body" :blok="blok" />
  </div>
</template>
