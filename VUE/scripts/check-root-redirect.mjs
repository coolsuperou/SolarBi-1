/**
 * Playwright smoke: root redirect matches viewport + pointer expectation.
 * Start dev server first (set BASE_URL if not 5173).
 *
 *   npm run dev
 *   set BASE_URL=http://localhost:5174/
 *   npm run test:e2e:root
 */
import { chromium, devices } from 'playwright'

const base = process.env.BASE_URL || 'http://localhost:5173/'

function mockPointerCoarse(value) {
  return () => {
    const orig = window.matchMedia.bind(window)
    window.matchMedia = (query) => {
      const r = orig(query)
      if (String(query).includes('any-pointer: coarse')) {
        return new Proxy(r, {
          get(target, prop) {
            if (prop === 'matches') return value
            return Reflect.get(target, prop)
          }
        })
      }
      return r
    }
  }
}

async function run() {
  const browser = await chromium.launch({
    channel: process.env.PW_CHANNEL || 'chrome'
  })
  try {
    const desktopLike = await browser.newContext({
      viewport: { width: 500, height: 800 },
      hasTouch: false,
      isMobile: false
    })
    const p1 = await desktopLike.newPage()
    await p1.addInitScript(mockPointerCoarse(false))
    await p1.goto(base, { waitUntil: 'domcontentloaded' })
    await p1.waitForURL(/\/(login|monthly-energy)(\/|$)/, { timeout: 15000 })
    const u1 = p1.url()
    if (u1.includes('/m/')) {
      throw new Error(`Expected non-/m after / on narrow + fine pointer, got: ${u1}`)
    }
    console.log('OK narrow+fine pointer:', u1)
    await desktopLike.close()

    const mobileLike = await browser.newContext({
      ...devices['iPhone 12']
    })
    const p2 = await mobileLike.newPage()
    await p2.goto(base, { waitUntil: 'domcontentloaded' })
    await p2.waitForURL(/\/m\//, { timeout: 15000 })
    const u2 = p2.url()
    console.log('OK narrow+touch device:', u2)
    await mobileLike.close()

    const wide = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    const p3 = await wide.newPage()
    await p3.addInitScript(mockPointerCoarse(false))
    await p3.goto(base, { waitUntil: 'domcontentloaded' })
    await p3.waitForURL(/\/(login|monthly-energy)(\/|$)/, { timeout: 15000 })
    const u3 = p3.url()
    if (u3.includes('/m/')) {
      throw new Error(`Expected non-/m after / on wide viewport, got: ${u3}`)
    }
    console.log('OK wide:', u3)
    await wide.close()
  } finally {
    await browser.close()
  }
  console.log('All checks passed.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
