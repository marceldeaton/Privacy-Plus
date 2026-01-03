# API Reference — Privacy+ SDK (public interfaces)

This reference documents public, non-privileged SDK interfaces for community components (lib/ for Node.js, python/ for Python). Signatures, parameter types, and behavior notes are provided.

Common concepts
- Event: typed object with event_type, timestamp, and attributes.
- Metric: named numeric measurement with optional tags and timestamp.
- Collector: client-facing adaptor for recording events and metrics.
- Processor: in-process privacy pipeline.

Node.js (TypeScript) — main exports

class PrivacyPlusSDK
- constructor(options: SDKOptions)
  - options.apiKey?: string | null
  - options.endpoint?: string (default: https://ingest.privacyplustech.com)
  - options.collect?: CollectConfig
  - options.transport?: TransportConfig
- async init(): Promise<void>
- track(eventType: string, payload: Record<string, any>, meta?: EventMeta): Promise<void>
  - Records an event for processing and transport.
- measure(metricName: string, value: number, tags?: Record<string,string>, ts?: string): Promise<void>
- async flush(): Promise<void>
  - Forces upload of pending batches.
- configure(newConfig: Partial<SDKOptions>): void
  - Update runtime configuration (scrub rules, sampling).

Types
- SDKOptions
  - collect: { enabledEvents: string[], anonymizeIp?: boolean, localDP?: { enabled: boolean, epsilon?: number } }
  - transport: { batchSize?: number, uploadIntervalSeconds?: number, sinkType?: 'http' | 'file' }
- EventMeta
  - source?: string
  - traceId?: string

Python — main exports

class PrivacyPlus
- __init__(self, api_key: str, endpoint: str = "https://ingest.privacyplustech.com", collect: dict = None)
- async def init(self) -> None
- async def track(self, event_type: str, payload: dict, meta: dict = None) -> None
- async def measure(self, metric_name: str, value: float, tags: dict = None, ts: str = None) -> None
- async def flush(self) -> None
- def configure(self, new_config: dict) -> None

Privacy & Processing Layer (public hooks)

SchemaEnforcer.validate(event: Event) -> ValidationResult
- Validates and normalizes event payloads against active schema.

Scrubber.apply(payload: dict, rules: ScrubRules) -> dict
- Applies configured per-field transformations.

Pseudonymizer.map(value: str, namespace: str) -> string
- Deterministic keyed mapping that returns a stable pseudonymous token.

LocalDPAdapter.apply(metricName: str, value: number, params: DPParams) -> number
- Returns a noise-added numeric value per configured DP parameters.

Transport & Sink interfaces

Transport.enqueue(batch: EventBatch): void
HttpSink.send(batch: EventBatch): Promise<SendResult>
- Sends batch with transport-layer integrity metadata.

Administrative & diagnostics

KeyManager.getPublicKey(keyId: string): Promise<PublicKeyInfo>
TelemetryInspector.getQueueLength(): number
Diagnostics.reportIssue(metadata: dict): Promise<void>

Behavioral notes
- Pseudonymizer outputs are stable for a given namespace and secret; no reversible mapping is exposed via public APIs.
- LocalDPAdapter exposes mechanism and parameter metadata in processing provenance to support downstream validation.
- Public APIs do not expose privileged operations. Interfaces that require elevated privileges are implemented in restricted modules and are not part of community packages.
