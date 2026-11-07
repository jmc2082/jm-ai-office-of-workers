import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService, type SignInStep } from '@/services/authService'

/** Who is signed in. `ready` turns true once the stored session has been checked. */
export const useAuthStore = defineStore('auth', () => {
  const enabled = authService.enabled
  const ready = ref(!enabled)
  const signedIn = ref(!enabled)
  const email = ref<string | null>(null)

  let checking: Promise<void> | null = null

  /** Restores a session saved by a previous visit. Safe to call repeatedly. */
  function init(): Promise<void> {
    if (ready.value) return Promise.resolve()
    checking ??= (async () => {
      email.value = await authService.currentUser()
      signedIn.value = email.value !== null && (await authService.getAccessToken()) !== null
      ready.value = true
    })()
    return checking
  }

  async function signIn(userEmail: string, password: string): Promise<SignInStep> {
    const step = await authService.signIn(userEmail, password)
    if (step === 'done') await markSignedIn()
    return step
  }

  async function confirm(answer: string): Promise<SignInStep> {
    const step = await authService.confirm(answer)
    if (step === 'done') await markSignedIn()
    return step
  }

  async function markSignedIn() {
    email.value = await authService.currentUser()
    signedIn.value = true
    ready.value = true
  }

  async function signOut() {
    try {
      await authService.signOut()
    } finally {
      signedIn.value = !enabled
      email.value = null
    }
  }

  return { enabled, ready, signedIn, email, init, signIn, confirm, signOut }
})
