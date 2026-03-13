# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NetSuite SDF project implementing a **ContextQL Custom Tool** — exposes NetSuite table schemas to AI clients via the NetSuite AI Connector Service (MCP). Two-phase system: (1) a Suitelet generates schema JSON files from the Records Catalog API, (2) a Custom Tool serves those schemas to MCP consumers.

## Architecture

### Data Flow

```
Records Catalog API (/app/recordscatalog/rcendpoint.nl)
    ↓ (browser-side JS fetches, 10 concurrent requests)
Suitelet POST handler → saves .json files to File Cabinet
    ↓
/SuiteScripts/ContextQL/TablesSchemas/{tableid}.json + manifest.json
    ↓ (N/file.load at runtime)
Custom Tool (customtool_context_ql.js) → MCP / AI Clients
```

### Schema Generation (Phase 1 — runs in browser)
The Suitelet (`br_context_ql_create_shema_sl.js`) serves an HTML page that does all the work **client-side**:
- GET handler: renders `br_context_ql_build_shema_index.html` as inline HTML in a NetSuite form
- The HTML/JS fetches `getRecordTypes` (with `structureType: FLAT`), filters to `isAvailable: true`, then fetches `getRecordTypeDetail` (with `detailType: SS_ANAL`) for each record
- Subrecords discovered in each record's response are also fetched and saved
- Each schema is cleaned via `cleanResponseData()` — strips everything except SuiteQL-relevant fields (id, label, dataType, fieldType, isColumn, joins)
- Files are saved by POSTing back to the Suitelet, which writes to the `TablesSchemas` folder using `N/file`
- A `manifest.json` is saved last with the full table index

### Custom Tool (Phase 2 — runtime)
`customtool_context_ql.js` is a `@NApiVersion 2.1` module with async functions:
- **`listTables(args)`** — loads `manifest.json`, filters by `args.search` (case-insensitive on id/label), applies `args.limit`
- **`getTableSchema(args)`** — loads `TablesSchemas/{id}.json` directly by path

Returns are `JSON.stringify()`'d as required by the Custom Tool spec.

### SDF Objects (`src/Objects/`)
- `customtool_context_ql.xml` — Custom Tool definition (`<tool>` format, `exposeto3rdpartyagents=T`)
- `customscript_contextql_schema_sl.xml` — Suitelet script + deployment (auto-deploys via SDF)

### File Paths Convention
All `N/file` operations use absolute File Cabinet paths:
- Schemas: `/SuiteScripts/ContextQL/TablesSchemas/{tableid}.json`
- Manifest: `/SuiteScripts/ContextQL/TablesSchemas/manifest.json`

## Development Commands

```bash
suitecloud project:validate    # Validate project structure
suitecloud project:deploy      # Deploy to NetSuite account
suitecloud object:import       # Import objects from account
suitecloud file:list           # List File Cabinet files
suitecloud account:setup       # Configure account credentials
```

## Important Notes

- Schema generation runs **entirely in the browser** — the tab must stay open during the process
- The Custom Tool will not work until schemas are generated via the Suitelet
- Only fields with `isAvailable: true` are included in generated schemas
- The Suitelet finds the `TablesSchemas` folder by searching for a folder named "TablesSchemas" — this folder must exist before generation
- Records Catalog API endpoint: `/app/recordscatalog/rcendpoint.nl` (internal NetSuite API, not RESTlet)
- Concurrent request limit is hardcoded to 10 in the HTML client
- Unsupported modules in Custom Tools: `N/http`, `N/https`, `N/sftp`
- MCP connection URL for ACP projects: `https://<accountid>.suitetalk.api.netsuite.com/services/mcp/v1/all`

## CLI Compatibility Note

SuiteCloud CLI 3.1.2 does not natively recognize `<tool>` or `<toolset>` object types during local validation (shows "categorized as data file" warning). The **server** accepts and deploys them correctly. When a newer CLI version adds `<toolset>` support, migrate from `<tool>` to `<toolset>` format with `exposetoaiconnector` flag.
