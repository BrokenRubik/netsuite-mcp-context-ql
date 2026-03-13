# NetSuite ContextQL Custom Tool

A [NetSuite Custom Tool](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_162020236.html) that exposes your account's table schemas from the [Records Catalog](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_155929845760.html) to AI clients via the [NetSuite AI Connector Service (MCP)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0714082142.html).

## What This Does

Provides two functions accessible to AI assistants and external integrations:

- **`listTables`** - Search and list available NetSuite record types/tables
- **`getTableSchema`** - Get complete field definitions for any table

Perfect for building AI-powered integrations, automating SuiteQL query generation, or exploring your NetSuite data structure programmatically.

## Prerequisites

- NetSuite account (2025.2+) with:
  - Server SuiteScript enabled
  - SuiteCloud Development Framework enabled
  - OAuth 2.0 enabled
  - Administrator or appropriate role permissions
- [SuiteCloud CLI installed](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558708810.html) (requires Node.js and Java)

## Installation

### 1. Install SuiteCloud CLI

```bash
npm install -g @oracle/suitecloud-cli
```

### 2. Setup Project Authentication

```bash
git clone <repository-url>
cd netsuite-mcp-context-ql
suitecloud account:setup
```

### 3. Deploy

```bash
suitecloud project:validate
suitecloud project:deploy
```

This deploys:
- The **Custom Tool** (`customtool_context_ql`) — exposed to the AI Connector Service
- The **Schema Generator Suitelet** (`customscript_contextql_schema_sl`) — auto-deployed with script record and deployment, no manual setup needed

### 4. Generate Schemas (Required Before Use)

1. Go to **Customization > Scripting > Script Deployments**
2. Find **"ContextQL Schema Generator"** and click its URL
3. Click **"Generate JSONs"**
4. Wait for completion (may take several minutes — keep the browser tab open)

This creates individual JSON schema files for each record type in `/SuiteScripts/ContextQL/TablesSchemas/` plus a `manifest.json` index.

**The Custom Tool will not work until schemas are generated.**

### 5. Connect via AI Client

In [Claude](https://claude.ai):

1. Go to **Settings > Connectors > Add custom connector**
2. Enter the MCP server URL:
   ```
   https://<accountid>.suitetalk.api.netsuite.com/services/mcp/v1/all
   ```
3. Click **Add**, then **Connect**
4. Authorize access to your NetSuite account

See [Connecting to the AI Connector Service](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0714082142.html) for full details.

## Usage

Once connected, use natural language prompts:

```
"List all NetSuite tables with 'customer' in the name"
"Show me the schema for the transaction table"
"What fields are available on the employee record?"
```

### API Reference

**`listTables(args)`**

```javascript
// Input
{ "search": "inventory", "limit": "10" }

// Output
{
  "tables": [
    { "id": "inventorybalance", "label": "Inventory Balance" },
    { "id": "inventorynumber", "label": "Inventory Number" }
  ],
  "totalFound": 2,
  "totalInManifest": 150
}
```

**`getTableSchema(args)`**

```javascript
// Input
{ "id": "customer" }

// Output
{
  "id": "customer",
  "details": {
    "fields": [
      { "id": "id", "label": "Internal ID", "dataType": "INTEGER", "isAvailable": true },
      { "id": "entityid", "label": "Name", "dataType": "STRING", "isAvailable": true }
    ]
  }
}
```

## Architecture

```
NetSuite Records Catalog API
         ↓ (browser-side, 10 concurrent requests)
Schema Generator Suitelet → File Cabinet (/SuiteScripts/ContextQL/TablesSchemas/)
         ↓ (N/file.load at runtime)
Custom Tool (customtool_context_ql.js)
         ↓
AI Connector Service (MCP) → Claude / ChatGPT / External Integrations
```

**Key Files:**

| File | Purpose |
|------|---------|
| `src/Objects/customtool_context_ql.xml` | Custom Tool SDF object definition |
| `src/Objects/customscript_contextql_schema_sl.xml` | Suitelet SDF object + deployment |
| `src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.js` | Tool implementation |
| `src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.json` | RPC schema (tool interface) |
| `src/FileCabinet/SuiteScripts/ContextQL/br_context_ql_create_shema_sl.js` | Schema generator Suitelet |
| `src/FileCabinet/SuiteScripts/ContextQL/br_context_ql_build_shema_index.html` | Schema generator UI |

## Maintenance

### Regenerate Schemas

NetSuite's Records Catalog changes when you add custom fields, records, or upgrade versions. Regenerate schemas by navigating to the Suitelet URL and clicking "Generate JSONs" again.

### Update Code

```bash
suitecloud project:validate
suitecloud project:deploy
```

## Notes

- Only includes SuiteQL-compatible fields (`isAvailable: true` in Records Catalog)
- Requires File Cabinet read permissions for `/SuiteScripts/ContextQL/`
- Schema generation time varies based on account size and customization
- Custom Tool scripts cannot use `N/http`, `N/https`, or `N/sftp` modules

## Resources

- [NetSuite Custom Tools](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_1185045525.html)
- [Custom Tool Script Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0724071739.html)
- [Custom Tool RPC Schema](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0724092648.html)
- [AI Connector Service Connection](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0714082142.html)
- [Records Catalog](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_155929845760.html)
- [SuiteCloud CLI](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_155931263126.html)
- [Oracle MCP Sample Tools](https://github.com/oracle-samples/netsuite-suitecloud-samples/tree/main/MCP-Sample-Tools)
