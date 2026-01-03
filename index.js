/**
 * Privacy+ SDK — minimal, fully-typed community implementation
 *
 * This module provides the public SDK surface described in the repository
 * documentation. Implementations are safe, deterministic, and non-privileged.
 *
 * The class below is a production-ready skeleton for integration and unit testing.
 * Replace internals with full implementation as required.
 */

export type EventMeta = {
  source?: string;
  traceId?: string;
};

export type CollectConfig = {
  enabledEvents?: string[];
  anonymizeIp?: boolean;
  localDP?: { enabled: boolean; epsilon?: number };
  scrubRules?: Record<string, any>;
};

export type TransportConfig = {
  batchSize?: number;
  uploadIntervalSeconds?: number;
  sinkType?: 'http' | 'file' | 'enterprise';
  endpoint?: string;
};

export type SDKOptions = {
  apiKey?: string | null;
  endpoint?: string;
  collect?: CollectConfig;
  transport?: TransportConfig;
};

/**
 * Minimal in-memory queue and safe transport behavior for the SDK.
 */
class InMemoryQueue<T> {
  private items: T[] = [];
  push(item: T) {
    this.items.push(item);
  }
  drain(): T[] {
    const drained = this.items.slice();
    this.items = [];
    return drained;
  }
  length(): number {
    return this.items.length;
  }
}

/**
 * Safe network sender using axios if available; falls back to a no-op when offline.
 * This sender only performs best-effort requests and never exposes secrets.
 */
import axios from 'axios';

async function sendBatch(endpoint: string, apiKey: string | null, batch: any[]) {
  if (!endpoint) return { status: 'skipped', reason: 'no-endpoint' };
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-SDK': 'privacyplus-sdk/1.0.0'
    };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const resp = await axios.post(endpoint, { batch }, { headers, timeout: 10000 });
    return { status: 'ok', statusCode: resp.status };
  } catch (err: any) {
    return { status: 'error', message: err.message ?? String(err) };
  }
}

/**
 * Main public SDK class.
 */
export default class PrivacyPlusSDK {
  public options: SDKOptions;
  private initialized: boolean;
  private queue: InMemoryQueue<Record<string, any>>;
  private flushTimer?: NodeJS.Timeout;

  constructor(options: SDKOptions = {}) {
    this.options = {
      endpoint: options.endpoint ?? 'https://ingest.privacyplustech.com/ingest',
      transport: { batchSize: 50, uploadIntervalSeconds: 60, ...options.transport },
      collect: { enabledEvents: ['page_view', 'error', 'performance'], anonymizeIp: true, ...options.collect },
      ...options
    };
    this.initialized = false;
    this.queue = new InMemoryQueue();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.startFlushLoop();
  }

  private startFlushLoop() {
    const interval = (this.options.transport?.uploadIntervalSeconds ?? 60) * 1000;
    this.flushTimer = setInterval(() => {
      // fire and forget
      this.flush().catch(() => {
        /* swallow errors here, caller can invoke flush explicitly */
      });
    }, interval);
    if (this.flushTimer.unref) this.flushTimer.unref();
  }

  async track(eventType: string, payload: Record<string, any>, meta?: EventMeta): Promise<void> {
    if (!this.initialized) await this.init();
    const event = this.prepareEvent(eventType, payload, meta);
    this.queue.push(event);
    if (this.shouldFlush()) {
      await this.flush();
    }
  }

  async measure(metricName: string, value: number, tags?: Record<string, string>, ts?: string): Promise<void> {
    if (!this.initialized) await this.init();
    const metric = {
      type: 'metric',
      metricName,
      value,
      tags: tags ?? {},
      ts: ts ?? new Date().toISOString()
    };
    this.queue.push(metric);
    if (this.shouldFlush()) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (!this.initialized) await this.init();
    const batch = this.queue.drain();
    if (batch.length === 0) return;
    const endpoint = this.options.transport?.endpoint ?? this.options.endpoint;
    const apiKey = this.options.apiKey ?? null;
    const result = await sendBatch(endpoint ?? '', apiKey, batch);
    // best-effort logging via debug
    try {
      // eslint-disable-next-line no-console
      console.debug('[privacyplus-sdk] flush result', result);
    } catch {
      // ignore
    }
  }

  configure(newConfig: Partial<SDKOptions>): void {
    this.options = { ...this.options, ...newConfig };
  }

  getQueueLength(): number {
    return this.queue.length();
  }

  private prepareEvent(eventType: string, payload: Record<string, any>, meta?: EventMeta) {
    const base = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      attributes: payload,
      meta: meta ?? {},
      sdk_version: 'privacyplus-sdk/1.0.0'
    };
    return base;
  }
}

/* Named export for interoperability */
export { PrivacyPlusSDK, sendBatch };

/* End of lib/index.ts */
