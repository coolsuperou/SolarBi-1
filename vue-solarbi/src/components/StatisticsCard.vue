<template>
  <div class="stats-card">
    <div class="stats-icon">
      <i :class="`bi bi-${icon}`"></i>
    </div>
    <div class="stats-value" :class="valueClass">
      {{ formattedValue }}
    </div>
    <div class="stats-label">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  value: number | string
  label: string
  unit?: string
  precision?: number
  valueClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  precision: 2,
  valueClass: ''
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return `${props.value.toFixed(props.precision)}${props.unit}`
  }
  return `${props.value}${props.unit}`
})
</script>



