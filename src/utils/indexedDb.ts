/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RodentSpecimen } from '../types';

const DB_NAME = 'ericon_offline_db';
const STORE_NAME = 'specimens_queue';
const DB_VERSION = 2; // Upgraded to support multiple stores

export interface QueuedFetchRequest {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: string;
}

/**
 * Initializes the IndexedDB database and returns a Promise pointing to the IDBDatabase.
 */
export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'Record_ID' });
      }
      if (!db.objectStoreNames.contains('api_requests_queue')) {
        db.createObjectStore('api_requests_queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to open IndexedDB: ${event.target.error?.message || 'Unknown error'}`));
    };
  });
}

/**
 * Adds an observation record to the offline IndexedDB queue.
 */
export async function queueOfflineSpecimen(specimen: RodentSpecimen): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(specimen);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to insert specimen into offline queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Retrieves all currently queued offline specimens.
 */
export async function getQueuedOfflineSpecimens(): Promise<RodentSpecimen[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event: any) => {
      resolve(event.target.result as RodentSpecimen[]);
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to retrieve offline specimen queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Removes a specific specimen from the offline queue.
 */
export async function dequeueOfflineSpecimen(recordId: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(recordId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to delete record ${recordId} from offline queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Fully clears the offline queue store.
 */
export async function clearOfflineQueue(): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to clear IndexedDB queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Adds a generic API request to the IndexedDB queue.
 */
export async function queueApiRequest(req: QueuedFetchRequest): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['api_requests_queue'], 'readwrite');
    const store = transaction.objectStore('api_requests_queue');
    const request = store.put(req);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => {
      reject(new Error(`Failed to queue API request: ${event.target.error?.message}`));
    };
  });
}

/**
 * Retrieves all currently queued generic API requests.
 */
export async function getQueuedApiRequests(): Promise<QueuedFetchRequest[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['api_requests_queue'], 'readonly');
    const store = transaction.objectStore('api_requests_queue');
    const request = store.getAll();

    request.onsuccess = (event: any) => {
      resolve(event.target.result || []);
    };

    request.onerror = (event: any) => {
      reject(new Error(`Failed to retrieve API request queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Removes a specific API request from the queue.
 */
export async function dequeueApiRequest(id: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['api_requests_queue'], 'readwrite');
    const store = transaction.objectStore('api_requests_queue');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => {
      reject(new Error(`Failed to delete record ${id} from API queue: ${event.target.error?.message}`));
    };
  });
}

/**
 * Overrides the browser's global fetch method to intercept requests if offline mode is active.
 */
export function setupGlobalFetchInterceptor(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__fetchIntercepted) return;

  const originalFetch = window.fetch;
  if (!originalFetch) return;

  const customFetch = async function (this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const isOffline = localStorage.getItem('ericon_offline_mode') === 'true';
    const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);

    if (isOffline && (urlStr.includes('/api/') || urlStr.startsWith('http'))) {
      console.log(`[Offline Mode Intercepted] URL: ${urlStr}`);

      let bodyText: string | null = null;
      if (init && init.body) {
        if (typeof init.body === 'string') {
          bodyText = init.body;
        } else {
          bodyText = '[Binary/Form Body Data]';
        }
      }

      const headersObj: Record<string, string> = {};
      if (init && init.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((val, key) => {
            headersObj[key] = val;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, val]) => {
            headersObj[key] = val;
          });
        } else {
          Object.assign(headersObj, init.headers);
        }
      }

      const id = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const reqRecord: QueuedFetchRequest = {
        id,
        url: urlStr,
        method: init?.method || 'GET',
        body: bodyText,
        headers: headersObj,
        timestamp: new Date().toISOString()
      };

      try {
        await queueApiRequest(reqRecord);
        window.dispatchEvent(new CustomEvent('ericon_offline_queue_changed'));
      } catch (err) {
        console.error('Failed to post intercepted request into IndexedDB queue:', err);
      }

      const mockResponse = {
        status: 'ok',
        success: true,
        message: 'Request intercepted by ERICON Offline Mode interceptor and queued inside IndexedDB',
        queuedId: id,
        data: []
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Offline-Intercepted': 'true'
        })
      });
    }

    return originalFetch.apply(this || window, [input, init]);
  };

  try {
    // Attempt standard assignment first
    (window as any).fetch = customFetch;
    (window as any).__fetchIntercepted = true;
  } catch (e) {
    // If it fails with "Cannot set property fetch which has only a getter", shadow it
    try {
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
      (window as any).__fetchIntercepted = true;
    } catch (err) {
      console.error('Critical Warning: Could not override window.fetch due to aggressive browser sandbox restrictions.', err);
    }
  }
}
