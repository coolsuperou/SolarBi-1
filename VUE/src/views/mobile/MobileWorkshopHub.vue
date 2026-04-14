<template>
  <div>
    <header class="m-header" style="margin-bottom: 0">
      <h2 class="m-header__title">{{ mWsHub.title }}</h2>
    </header>
    <p class="m-hint" style="margin: 12px 16px">{{ mWsHub.hint }}</p>

    <template v-if="front.length">
      <div class="m-group" style="margin: 0 12px 8px">
        <div class="m-group__head"><span>{{ mWsHub.front }}</span><i class="bi bi-chevron-down"></i></div>
        <ul class="m-list">
          <li v-for="r in front" :key="r.path">
            <RouterLink :to="mobileWorkshopPath(r)">
              <i :class="'bi ' + r.meta.icon" style="color: var(--primary, #3b82f6)"></i> {{ r.meta.title }}
              <i class="bi bi-chevron-right"></i>
            </RouterLink>
          </li>
        </ul>
      </div>
    </template>

    <template v-for="r in pressless" :key="r.path">
      <ul class="m-list" style="margin: 0 12px 8px">
        <li>
          <RouterLink :to="mobileWorkshopPath(r)">
            <i :class="'bi ' + r.meta.icon" style="color: var(--primary, #3b82f6)"></i> {{ r.meta.title }}
            <i class="bi bi-chevron-right"></i>
          </RouterLink>
        </li>
      </ul>
    </template>

    <template v-if="back.length">
      <div class="m-group" style="margin: 0 12px 8px">
        <div class="m-group__head"><span>{{ mWsHub.back }}</span><i class="bi bi-chevron-down"></i></div>
        <ul class="m-list">
          <li v-for="r in back" :key="r.path">
            <RouterLink :to="mobileWorkshopPath(r)">
              <i :class="'bi ' + r.meta.icon" style="color: var(--primary, #3b82f6)"></i> {{ r.meta.title }}
              <i class="bi bi-chevron-right"></i>
            </RouterLink>
          </li>
        </ul>
      </div>
    </template>

    <template v-if="public_.length">
      <div class="m-group" style="margin: 0 12px 8px">
        <div class="m-group__head"><span>{{ mWsHub.pub }}</span><i class="bi bi-chevron-down"></i></div>
        <ul class="m-list">
          <li v-for="r in public_" :key="r.path">
            <RouterLink :to="mobileWorkshopPath(r)">
              <i :class="'bi ' + r.meta.icon" style="color: var(--primary, #3b82f6)"></i> {{ r.meta.title }}
              <i class="bi bi-chevron-right"></i>
            </RouterLink>
          </li>
        </ul>
      </div>
    </template>

    <template v-if="other.length">
      <div class="m-group" style="margin: 0 12px 8px">
        <div class="m-group__head"><span>{{ mWsHub.other }}</span><i class="bi bi-chevron-down"></i></div>
        <ul class="m-list">
          <li v-for="r in other" :key="r.path">
            <RouterLink :to="mobileWorkshopPath(r)">
              <i :class="'bi ' + r.meta.icon" style="color: var(--primary, #3b82f6)"></i> {{ r.meta.title }}
              <i class="bi bi-chevron-right"></i>
            </RouterLink>
          </li>
        </ul>
      </div>
    </template>

    <p v-if="!hasAny" class="m-hint" style="margin: 24px 16px">{{ mWsHub.noPerm }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { workshopRouteEntries } from '@/router/workshopRoutesConfig'
import { authState, hasPagePermission } from '@/auth'
import { mWsHub } from '@/views/mobile/mobileUiStrings'
import { M } from '@/router/mobileUtils'

function filterByGroup(group) {
  return workshopRouteEntries.filter((ws) => ws.meta.group === group && (authState.isAdmin || hasPagePermission(ws.meta.permKey)))
}

function mobileWorkshopPath(r) {
  const slug = r.path.replace(/^\//, '')
  return M.workshopDetail(slug)
}

const front = computed(() => filterByGroup('front'))
const pressless = computed(() => filterByGroup('pressless'))
const back = computed(() => filterByGroup('back'))
const public_ = computed(() => filterByGroup('public'))
const other = computed(() => filterByGroup('other'))

const hasAny = computed(
  () => front.value.length + pressless.value.length + back.value.length + public_.value.length + other.value.length > 0
)
</script>
