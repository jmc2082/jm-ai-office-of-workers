/**
 * Supplies the Cognito access token for API calls. Returns null until Cognito
 * is wired up in Phase 0c (the API runs with AUTH_DISABLED=true locally).
 */
export const authService = {
  async getAccessToken(): Promise<string | null> {
    return null
  },
}
