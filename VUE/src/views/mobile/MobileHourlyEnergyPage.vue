<template>
  <MobileSubShell :title="mShellTitles.hourly">
    <HourlyEnergy />
  </MobileSubShell>
</template>

<script setup>
import MobileSubShell from '@/components/MobileSubShell.vue'
import HourlyEnergy from '@/views/desktop/HourlyEnergy.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
</script>
