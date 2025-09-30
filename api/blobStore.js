// Simple Vercel Blob JSON store for transfer metadata
// Key layout: transfers/{transferId}.json

import { put, head } from '@vercel/blob';

const buildKey = (transferId) => `transfers/${transferId}.json`;

export async function loadTransferFromBlob(transferId) {
  const key = buildKey(transferId);
  try {
    const meta = await head(key);
    if (!meta || !meta.url) return null;
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    // HEAD throws if not found
    return null;
  }
}

export async function saveTransferToBlob(transferId, transfer) {
  const key = buildKey(transferId);
  await put(key, JSON.stringify(transfer, null, 2), {
    contentType: 'application/json',
    access: 'private',
    cacheControlMaxAge: 0,
  });
}

export function createEmptyTransfer() {
  return { status: 'open', files: [], createdAt: Date.now() };
}


