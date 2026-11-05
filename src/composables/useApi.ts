import { isAxiosError } from 'axios'
import axios from '@/plugins/axios'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface ApiArgs {
  url: string
  data?: unknown
  params?: Record<string, unknown>
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

/** Thin wrapper over the axios instance that unwraps data and normalizes errors. */
export function useApi() {
  const request = async <T>(method: HttpMethod, { url, data, params }: ApiArgs): Promise<T> => {
    try {
      const response = await axios.request<T>({ method, url, data, params })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const body = error.response?.data as { message?: string | string[] } | undefined
        const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
        throw new ApiError(msg ?? error.message, error.response?.status)
      }
      throw error
    }
  }

  return {
    get: <T>(args: ApiArgs) => request<T>('GET', args),
    post: <T>(args: ApiArgs) => request<T>('POST', args),
    patch: <T>(args: ApiArgs) => request<T>('PATCH', args),
    del: <T>(args: ApiArgs) => request<T>('DELETE', args),
  }
}
