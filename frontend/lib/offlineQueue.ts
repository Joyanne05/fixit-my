/**
 * Offline Queue Manager
 * Uses IndexedDB to store pending reports when the user is offline.
 * Automatically syncs them when connectivity is restored.
 */

import { api } from './apiClient';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PendingReport {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  is_anonymous: boolean;
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
  createdAt: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DB_NAME = 'offlineReportsDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingReports';

// ── Database ───────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Queue Operations ───────────────────────────────────────────────────────────

export async function addPendingReport(report: PendingReport): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(report);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPendingReports(): Promise<PendingReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingReport(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Sync ────────────────────────────────────────────────────────────────────────

/**
 * Converts a base64 data URL back into a File object.
 */
function base64ToFile(base64: string, fileName: string, fileType: string): File {
  const arr = base64.split(',');
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], fileName, { type: fileType });
}

/**
 * Attempts to upload all pending reports.
 * Removes each report from the queue upon successful upload.
 */
export async function syncPendingReports(token: string): Promise<SyncResult> {
  const pending = await getAllPendingReports();
  let synced = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      const formData = new FormData();
      formData.append('title', report.title);
      formData.append('category', report.category);
      formData.append('description', report.description);
      formData.append('location', report.location);
      formData.append('is_anonymous', report.is_anonymous.toString());

      if (report.photoBase64 && report.photoName && report.photoType) {
        const file = base64ToFile(report.photoBase64, report.photoName, report.photoType);
        formData.append('photo', file);
      }

      await api.post('report/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      await removePendingReport(report.id);
      synced++;
    } catch (error) {
      console.error(`Failed to sync report "${report.title}":`, error);
      failed++;
    }
  }

  return { synced, failed };
}
