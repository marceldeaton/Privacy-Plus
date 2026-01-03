# Architecture — Privacy+ SDK

This document describes the architecture and the main modules of the Privacy+ SDK codebase.

Overview
- The SDK separates concerns into:
  - Collector adapters: language-specific entry points for applications to record events and metrics.
  - Privacy & processing layer: schema validation, scrubbers, pseudonymization, and optional local differential-privacy hooks.
  - Transport & sinks: batching, integrity metadata, retries, and delivery to ingestion endpoints.
  - Restricted/gated modules: enterprise-only modules for deeper platform telemetry; implemented separately and distributed under enterprise processes.

Core modules
- Collector Adapter Layer (lib/collectors)
  - NodeCollector: node runtime collector with async track/measure APIs.
- Privacy & Processing Layer (lib/processing)
  - SchemaEnforcer, Scrubber, Pseudonymizer, LocalDPAdapter.
- Transport & Sink Layer (lib/transport)
  - HttpSink, FileSink, EnterpriseSink (mutual TLS and attestation support).
- Server-side ingestion (examples/server)
  - Validation and storage of sanitized payloads.

Dataflow
1. Application calls collector.track() or collector.measure().
2. Processing pipeline normalizes the payload, applies scrub rules, and pseudonymizes configured fields.
3. Transport batches and sends signed payloads to an ingestion endpoint.
4. Ingestion verifies payload integrity and persists sanitized records.

Restricted modules
- Located under /restricted/ and distributed separately.
- Provide nexus for platform-level telemetry, profile mapping, and key/attestation management.

Observability & provenance
- Events include provenance metadata: sdk_version, schema_version, processing_steps, and applied transformations.
- Processing decisions are recorded in logs that can be examined for debugging and auditing.

Appendix — example schemata and scrub rule examples
- Example event schema:
  {
    "event_type": "string",
    "timestamp": "ISO8601",
    "attributes": { "key": "value" }
  }
- Scrub rule examples:
  - "user.email": { "action": "mask_domain" }
  - "ip": { "action": "truncate_network_prefix", "prefix_length": 24 }
