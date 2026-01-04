# Architecture — Privacy+ SDK (technical overview)

This document explains modules, responsibilities, and dataflow for Privacy+ SDK. Descriptions are technical and implementation-oriented; implementation detail that involves privileged access remains in gated modules.

Table of contents
- Overview
- Core modules (community)
- Dataflow and processing pipeline
- Restricted (gated) modules — functional descriptions
- Integration patterns
- Observability and processing metadata

Overview
Privacy+ SDK separates concerns into collector adapters, a privacy/processing pipeline, and transport sinks. This modularity enables reuse across languages and deployment models.

Core modules (community)

1) Collector Adapter Layer (lib/collectors)
- Purpose: Provide language-native APIs for applications to emit telemetry.
- Implementations:
  - NodeCollector (TypeScript): event and metric APIs for Node.js apps.
  - PyCollector (Python): asynchronous event and metric APIs for Python apps.
- Public surface:
  - track(eventType: string, payload: object, meta?: object): Promise<void>
  - measure(metricName: string, value: number, tags?: object, ts?: string): Promise<void>
  - flush(): Promise<void>

2) Privacy & Processing Layer (lib/processing)
- Purpose: Validate schemas, apply per-field scrubbing, perform deterministic pseudonymization, apply sampling and optional local privacy transforms.
- Components:
  - SchemaEnforcer: schema validation and normalization.
  - Scrubber: declarative field-level transformations (redact, mask, drop, truncate).
  - Pseudonymizer: keyed deterministic mapping for identifiers (stable tokens).
  - LocalDPAdapter: optional numeric-noise transforms for specified metrics.

3) Transport & Sink Layer (lib/transport)
- Purpose: Batch events, add integrity metadata, manage retries/backoff, and send to configured sinks.
- Sink implementations:
  - HttpSink: TLS transport with HMAC request integrity.
  - FileSink: local buffering for development.
  - EnterpriseSink: additional attestation headers and optional mutual TLS.

4) Server-side Ingestion (examples/server)
- Purpose: Verify payload integrity, validate schema versions, and persist sanitized records.
- Responsibilities: validate signature/HMAC, apply ingestion-level normalization, and forward to storage/analytics.

Dataflow and processing pipeline
1. Application calls Collector.track or Collector.measure.
2. Collector performs light validation and enqueues the event.
3. Processing pipeline:
   - SchemaEnforcer validates and normalizes payload.
   - Scrubber applies per-field transformations.
   - Pseudonymizer replaces specified identifiers with stable tokens.
   - LocalDPAdapter applies noise to numeric measurements when configured.
4. Transport Layer batches and sends signed payloads.
5. Ingestion verifies integrity and writes sanitized data to storage.

Restricted (gated) modules — functional descriptions
Modules that require elevated privileges or deeper platform integration are placed under /restricted/. Their descriptions below are functional; implementation and distribution are gated.

1) Privileged Collector (restricted/privileged-collector)
- Function: Collect aggregated platform signals (summaries of kernel or system telemetry) in environments where privileged collection is configured.
- Output: Structured, aggregated summaries (no raw kernel dumps) designed for downstream processing.

2) Platform Mapping & Normalization (restricted/mapping)
- Function: Normalize diverse environment metadata (platform fingerprints, environment attributes) into canonical profiles and deterministic pseudonymous identifiers for correlation across systems.
- Behavior: Deterministic mapping under a per-installation secret; outputs are stable pseudonymous tokens and canonical metadata shapes.

3) Key & Attestation Manager (restricted/keymanager)
- Function: Centralize cryptographic key usage for signing, integrity, and pseudonymization.
- Interfaces: key rotation metadata, public key exposure endpoints, and audit hooks for key operations.

Integration patterns
- Sidecar collector: run a collector process alongside application containers for low-touch integration.
- Library integration: embed the collector into application code for direct calls to track/measure.
- Edge aggregator: use a buffering layer that batches events locally and periodically uploads to ingestion endpoints.

Observability and processing metadata
- Every event carries provenance fields:
  - sdk_version, schema_version, processing_steps (scrub rules applied, pseudonymization applied, DP parameters if any).
- Event processing logs record transformation decisions for auditability: which scrub rules matched, which pseudonymizer namespaces were used, and whether local DP was applied.

Appendix: common schema examples (concise)
- Event schema:
  {
    "event_type": "string",
    "timestamp": "ISO8601",
    "attributes": { "key": "value" }
  }
- Scrub rule examples (declarative):
  - "user.email": action = "mask_domain"
  - "ip": action = "truncate_network_prefix"

Notes on gated distribution
- Restricted modules are separated in the codebase; community components do not include privileged implementation code. Access and packaging for gated modules are handled via the project's distribution procedures.
