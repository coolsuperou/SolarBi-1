<template>
  <MobileSubShell :title="mShellTitles.userMgmt">
    <UserManagement />
  </MobileSubShell>
</template>

<script setup>
import MobileSubShell from '@/components/MobileSubShell.vue'
import UserManagement from '@/views/desktop/UserManagement.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
</script>
