<template>
  <button @click="$emit('update:count', count + 1)">
    count is {{ count }}
  </button>
</template>

<script setup>
defineProps({
  count: Number,
});
</script>
