<template>
  <q-circular-progress
    show-value
    font-size="15px"
    :value="value"
    :size="size"
    :thickness="0.44"
    :color="color"
    track-color="grey-3"
    class="q-ma-md"
  >
    <q-icon :name="icon" />
    {{ value }}%
  </q-circular-progress>
</template>
<script setup>
defineProps({
  value: {
    type: Number,
    required: true,
    default: 100,
  },
  color: {
    type: String,
    default: "blue",
  },
  icon: {
    type: String,
    default: "water_drop",
  },
  size: {
    type: String,
    default: "100px",
  },
});
</script>
