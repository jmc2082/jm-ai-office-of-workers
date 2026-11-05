import { expect, test, type Page } from '@playwright/test'

// The API is mocked so this runs without jm-ai-office-api (e.g. in CI).
const now = new Date().toISOString()
const worker = {
  id: 1,
  slug: 'hello-reviewer',
  displayName: 'Proof',
  description: 'Reviews drafts.',
  department: 'quality',
  status: 'trial',
  avatar: null,
  schedule: null,
  enabled: true,
  modelTaskKey: 'hello.review',
  implemented: true,
  createdAt: now,
  lastRun: { id: 7, status: 'needs_you', startedAt: now, finishedAt: now },
  openCards: 1,
  runsToday: 1,
  costToday: 0.0012,
  nextRunAt: null,
}
const card = {
  id: 1,
  runId: 7,
  workerId: 1,
  kind: 'publish',
  title: 'Publish greeting?',
  summary: 'Looks friendly.',
  payload: { draft: 'Hi' },
  status: 'open',
  createdAt: now,
  resolvedAt: null,
  resolutionNote: null,
  worker: { slug: 'hello-reviewer', displayName: 'Proof', avatar: null },
}

async function mockApi(page: Page) {
  let open = [card]
  await page.route(/\/api\//, async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace(/^\/api/, '')
    const method = route.request().method()
    const json = (body: unknown, status = 200) => route.fulfill({ status, json: body })

    if (path === '/events/stream') return route.abort()
    if (path === '/stats')
      return json({ workers: 1, workingNow: 0, needYou: open.length, broken: 0, handoffsToday: 2, runsToday: 3, costToday: 0.0012, queue: { active: 0, pending: 0 }, since: now })
    if (path === '/stats/replay') return json({ bucketMs: 600000, since: now, buckets: [] })
    if (path === '/workers') return json([{ ...worker, openCards: open.length }])
    if (path === '/events') return json([{ id: 1, ts: now, workerId: 1, runId: 7, targetWorkerId: null, type: 'card_created', message: 'Proof put "Publish greeting?" in front of you' }])
    if (path === '/cards') return json(url.searchParams.get('status') === 'open' ? open : [])
    if (path === '/cards/1/approve' && method === 'POST') {
      open = []
      return json({ ...card, status: 'executed' }, 201)
    }
    return json({ message: 'not mocked' }, 404)
  })
}

test('shows the office and approves a card', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'The office' })).toBeVisible()
  await expect(page.locator('#needs-you-title')).toHaveText('Needs you · 1')
  await expect(page.getByText('Proof put "Publish greeting?" in front of you')).toBeVisible()

  const panel = page.locator('section[aria-labelledby="needs-you-title"]')
  await panel.getByRole('button', { name: 'Approve' }).click()
  await expect(page.locator('#needs-you-title')).toHaveText('Needs you · 0')
  await expect(panel.getByText('Nothing needs you')).toBeVisible()
})

test('navigates to the workers page', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await page.getByRole('link', { name: 'Workers' }).click()
  await expect(page.getByRole('heading', { name: 'Workers' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Proof' })).toBeVisible()
})
