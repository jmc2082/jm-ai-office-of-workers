import { Amplify } from 'aws-amplify'
import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  type SignInOutput,
} from 'aws-amplify/auth'

/**
 * Cognito sign-in. Auth is on only when both IDs are set (production, or local runs
 * pointed at the real user pool). Without them the app runs signed-out, matching the
 * API's AUTH_DISABLED=true local mode.
 */
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID

export const authEnabled = Boolean(USER_POOL_ID && CLIENT_ID)

if (authEnabled) {
  Amplify.configure({
    Auth: { Cognito: { userPoolId: USER_POOL_ID!, userPoolClientId: CLIENT_ID!, loginWith: { email: true } } },
  })
}

/** What the login form shows next. */
export type SignInStep = 'done' | 'new-password' | 'totp' | 'unsupported'

function stepOf(output: SignInOutput): SignInStep {
  if (output.isSignedIn) return 'done'
  switch (output.nextStep.signInStep) {
    case 'DONE':
      return 'done'
    case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
      return 'new-password'
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return 'totp'
    default:
      return 'unsupported'
  }
}

let onUnauthorized: (() => void) | null = null

export const authService = {
  enabled: authEnabled,

  /** Current access token, refreshed by Amplify when it's close to expiring. */
  async getAccessToken(): Promise<string | null> {
    if (!authEnabled) return null
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() ?? null
    } catch {
      return null
    }
  },

  /** The signed-in user's email (their Cognito username), or null. */
  async currentUser(): Promise<string | null> {
    if (!authEnabled) return null
    try {
      const user = await getCurrentUser()
      return user.signInDetails?.loginId ?? user.username
    } catch {
      return null
    }
  },

  async signIn(email: string, password: string): Promise<SignInStep> {
    return stepOf(await signIn({ username: email.trim(), password }))
  },

  /** Answers the current challenge: a new password, or a 6-digit authenticator code. */
  async confirm(answer: string): Promise<SignInStep> {
    return stepOf(await confirmSignIn({ challengeResponse: answer.trim() }))
  },

  async signOut(): Promise<void> {
    if (authEnabled) await signOut()
  },

  /** Registers what to do when the API rejects our token (set once in main.ts). */
  setUnauthorizedHandler(handler: () => void) {
    onUnauthorized = handler
  },

  handleUnauthorized() {
    if (authEnabled) onUnauthorized?.()
  },
}

/** Turns Cognito errors into something worth showing on the login form. */
export function authErrorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name
  switch (name) {
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
      return 'Wrong email or password.'
    case 'CodeMismatchException':
      return 'That code is not right. Try the current one from your authenticator app.'
    case 'InvalidPasswordException':
      return 'Password must be at least 14 characters, with upper and lower case letters and a number.'
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return 'Too many attempts. Wait a minute and try again.'
    default:
      return error instanceof Error ? error.message : 'Sign-in failed.'
  }
}
