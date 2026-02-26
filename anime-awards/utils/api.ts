const WORKER_URL = 'https://animeawards-api-cache.negativezero338.workers.dev/';

export async function fetchFromAPI(path: string) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
