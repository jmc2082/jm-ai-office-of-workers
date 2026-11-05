import axios from 'axios'
import { authService } from '@/services/authService'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4100/api'

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
})

instance.interceptors.request.use(async (config) => {
  const token = await authService.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default instance
