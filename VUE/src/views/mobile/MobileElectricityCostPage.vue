<template>
  <MobileSubShell :title="mShellTitles.cost" content-class="cost-ec-wrap">
    <ElectricityCost is-mobile-layout />
  </MobileSubShell>
</template>

<script setup>
import MobileSubShell from '@/components/MobileSubShell.vue'
import ElectricityCost from '@/views/desktop/ElectricityCost.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
</script>
