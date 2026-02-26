// utils/api.ts
const WORKER_URL = 'https://animeawards-api-cache.negativezero338.workers.dev';

export async function fetchFromAPI(path: string) {
  // Ensure path starts with a single slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${WORKER_URL}${cleanPath}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }
  return res.json();
}
