import { onScopeDispose, ref } from 'vue'

/** A Date ref that ticks every `ms` (default 30s) for relative times and clocks. */
export function useNow(ms = 30_000) {
  const now = ref(new Date())
  const id = setInterval(() => (now.value = new Date()), ms)
  onScopeDispose(() => clearInterval(id))
  return now
}
