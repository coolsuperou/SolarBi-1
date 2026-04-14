<template>
  <div>
    <header class="m-header" style="margin-bottom: 0">
      <h2 class="m-header__title">{{ mStats.title }}</h2>
    </header>
    <p class="m-hint" style="margin: 12px 16px">{{ mStats.hint }}</p>
    <ul class="m-list" style="margin: 0 12px">
      <li v-if="canMonthly">
        <RouterLink :to="M.MONTHLY_ENERGY">
          <i class="bi bi-calendar3" style="color: #1677ff"></i> {{ mStats.monthly }}
          <span style="margin-left: auto; font-size: 12px; color: #94a3b8">{{ mStats.enter }}</span>
          <i class="bi bi-chevron-right"></i>
        </RouterLink>
      </li>
      <li v-if="canHourly">
        <RouterLink :to="M.HOURLY_ENERGY">
          <i class="bi bi-clock" style="color: #1677ff"></i> {{ mStats.hourly }}
          <span style="margin-left: auto; font-size: 12px; color: #94a3b8">{{ mStats.enter }}</span>
          <i class="bi bi-chevron-right"></i>
        </RouterLink>
      </li>
      <li v-if="canCost">
        <RouterLink :to="M.ELECTRICITY_COST">
          <i class="bi bi-calculator" style="color: #1677ff"></i> {{ mStats.cost }}
          <span style="margin-left: auto; font-size: 12px; color: #94a3b8">{{ mStats.enter }}</span>
          <i class="bi bi-chevron-right"></i>
        </RouterLink>
      </li>
      <li v-if="!canMonthly && !canHourly && !canCost">
        <span class="m-hint" style="display: block; padding: 14px 16px">{{ mStats.noPerm }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { authState, hasPagePermission } from '@/auth'
import { mStats } from '@/views/mobile/mobileUiStrings'
import { M } from '@/router/mobileUtils'

const canMonthly = computed(() => authState.isAdmin || hasPagePermission('monthly-energy'))
const canHourly = computed(() => authState.isAdmin || hasPagePermission('hourly-energy'))
const canCost = computed(() => authState.isAdmin || hasPagePermission('electricity-cost-allocation'))
</script>
