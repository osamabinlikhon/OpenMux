// Lightweight helper for main process to call sandbox endpoints if needed by other modules
import fetch from 'node-fetch';

export async function sandboxRequest(base: string, path: string, options: any = {}) {
  const url = new URL(path, base).toString();
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
    const buffer = await res.arrayBuffer();
    return { isImage: true, data: Buffer.from(buffer) };
  }
  const text = await res.text();
  try {
    return { json: JSON.parse(text) };
  } catch (e) {
    return { text };
  }
}
