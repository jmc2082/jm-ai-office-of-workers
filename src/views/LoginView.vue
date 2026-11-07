<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { authErrorMessage, type SignInStep } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const step = ref<Exclude<SignInStep, 'done'> | 'credentials'>('credentials')
const email = ref('')
const password = ref('')
const newPassword = ref('')
const newPasswordAgain = ref('')
const code = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const firstField = ref<HTMLInputElement | null>(null)

const heading = computed(
  () =>
    ({
      credentials: 'Sign in',
      'new-password': 'Choose a new password',
      totp: 'Enter your code',
      unsupported: 'Sign in',
    })[step.value],
)

async function next(result: SignInStep) {
  if (result === 'done') {
    // Only same-app paths: "/runs" yes, "//other.site" or "https://…" no.
    const redirect = route.query.redirect
    const target = typeof redirect === 'string' && /^\/(?!\/)/.test(redirect) ? redirect : '/'
    await router.replace(target)
    return
  }
  step.value = result
  if (result === 'unsupported') {
    error.value = 'Cognito asked for a sign-in step this page does not handle yet.'
  }
  await nextTick()
  firstField.value?.focus()
}

async function submit() {
  error.value = null
  if (step.value === 'new-password' && newPassword.value !== newPasswordAgain.value) {
    error.value = 'The two passwords do not match.'
    return
  }
  busy.value = true
  try {
    if (step.value === 'credentials') await next(await auth.signIn(email.value, password.value))
    else if (step.value === 'new-password') await next(await auth.confirm(newPassword.value))
    else if (step.value === 'totp') await next(await auth.confirm(code.value))
  } catch (e) {
    error.value = authErrorMessage(e)
  } finally {
    busy.value = false
  }
}

function startOver() {
  step.value = 'credentials'
  password.value = ''
  newPassword.value = ''
  newPasswordAgain.value = ''
  code.value = ''
  error.value = null
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center bg-page px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex items-center justify-center gap-2.5">
        <span class="grid size-10 place-items-center rounded-full bg-rail text-accent">
          <AppIcon name="office" :size="20" />
        </span>
        <span class="text-lg font-semibold tracking-tight text-ink">JM Office</span>
      </div>

      <form class="panel space-y-4 p-6 shadow-sm" novalidate @submit.prevent="submit">
        <div>
          <p class="eyebrow">Office of AI workers</p>
          <h1 class="mt-1 text-xl font-semibold text-ink">{{ heading }}</h1>
          <p v-if="step === 'new-password'" class="mt-1 text-sm text-ink-2">
            Your temporary password worked. Pick the one you'll use from now on.
          </p>
          <p v-else-if="step === 'totp'" class="mt-1 text-sm text-ink-2">
            Open your authenticator app and enter the 6-digit code for JM Office.
          </p>
        </div>

        <template v-if="step === 'credentials' || step === 'unsupported'">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-ink">Email</span>
            <input
              ref="firstField"
              v-model="email"
              type="email"
              name="email"
              autocomplete="username"
              required
              autofocus
              class="field w-full py-2"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-ink">Password</span>
            <input
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              class="field w-full py-2"
            />
          </label>
        </template>

        <template v-else-if="step === 'new-password'">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-ink">New password</span>
            <input
              ref="firstField"
              v-model="newPassword"
              type="password"
              name="new-password"
              autocomplete="new-password"
              minlength="14"
              required
              class="field w-full py-2"
            />
            <span class="mt-1 block text-xs text-muted">At least 14 characters, with upper and lower case letters and a number.</span>
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-ink">New password again</span>
            <input
              v-model="newPasswordAgain"
              type="password"
              name="new-password-again"
              autocomplete="new-password"
              required
              class="field w-full py-2"
            />
          </label>
        </template>

        <label v-else-if="step === 'totp'" class="block">
          <span class="mb-1 block text-sm font-medium text-ink">Code</span>
          <input
            ref="firstField"
            v-model="code"
            type="text"
            name="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength="6"
            required
            class="field w-full py-2 text-center text-lg tracking-[0.4em] num"
          />
        </label>

        <p
          v-if="error"
          role="alert"
          class="flex items-start gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-ink ring-1 ring-critical/30"
        >
          <AppIcon name="alert" :size="16" class="mt-0.5 shrink-0 text-critical" />
          <span>{{ error }}</span>
        </p>

        <button type="submit" class="btn-primary w-full py-2.5" :disabled="busy">
          {{ busy ? 'Signing in…' : step === 'new-password' ? 'Save and sign in' : step === 'totp' ? 'Verify' : 'Sign in' }}
        </button>

        <button
          v-if="step === 'new-password' || step === 'totp'"
          type="button"
          class="block w-full text-center text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
          @click="startOver"
        >
          Use a different account
        </button>
      </form>
    </div>
  </main>
</template>
