<template>
  <MobileSubShell :title="mShellTitles.monthly">
    <MonthlyEnergy />
  </MobileSubShell>
</template>

<script setup>
import MobileSubShell from '@/components/MobileSubShell.vue'
import MonthlyEnergy from '@/views/desktop/MonthlyEnergy.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
</script>
