Privacy+ SDK — Proprietary kernel-level SDK for secure hardware and firmware integration, developed by Privacy+ Technologies™.

The Privacy+ SDK is a modular telemetry and system-insight SDK providing collectors, privacy-preserving processing primitives, and transport adapters for operational analytics and monitoring.

This repository contains:

Community SDK components written in Node.js and TypeScript

Example integrations

Architecture and data-flow documentation

A controlled area for gated enterprise modules

Ownership & Contacts

Copyright © 2026 Marcel Deaton
Operating as: Privacy Plus Technologies™

Owner / Primary Contact:
Marcel Deaton — mdeaton11@liberty.edu

Enterprise Inquiries:
enterprise@privacyplustech.com
business@privacyplustech.com

Trademark Inquiries:
trademarks@privacyplustech.com

Security Reports:
enterprise@privacyplustech.com
mdeaton11@liberty.edu

Repository Contents

/lib/ — TypeScript SDK source and example integrations

/dist/ — Compiled build output (generated)

/docs/ — Architecture, data flow, and module documentation

/restricted/ — Gated enterprise modules (access-controlled)

Governance & Legal

LICENSE (dual-license summary)

LICENSE-GPL-3.0.txt

ENTERPRISE_LICENSE.md

NOTICE.md

CONTRIBUTING.md

SECURITY.md

CONTRIBUTOR_LICENSE_AGREEMENT.md

ACCEPTABLE_USE_POLICY.md

Package Details

Package name: @privacyplus/sdk

Version: 1.0.0

Module type: ES Module

Main entrypoint: dist/index.js

Types: dist/index.d.ts

Build & Quick Start (Node.js)
Requirements

Node.js 16+

Install & Build
git clone https://github.com/privacyplus/privacyplus-sdk.git
cd privacyplus-sdk
npm ci
npm run build

Run Example
npm run start:example


The example server runs a minimal reference implementation using compiled dist files.

Support & Contributions

Community contributions are accepted under GPL-3.0-or-later by default.

See CONTRIBUTING.md and CONTRIBUTOR_LICENSE_AGREEMENT.md for contribution terms.

For enterprise distribution, gated modules, or commercial support, contact
enterprise@privacyplustech.com

Release Information

Initial Public Release: v1.0.0

See the /docs directory for full architecture details and API references.

Copyright & Trademarks

© 2026 Privacy+ Technologies™, operating as Privacy Plus Technologies™. All rights reserved.

“Privacy Plus Technologies™” and the Privacy Plus Technologies™ logo are trademarks of Privacy+ Technologies.
All other trademarks are the property of their respective owners
