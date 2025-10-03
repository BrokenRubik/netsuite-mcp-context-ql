# NetSuite ContextQL Custom Tool

A [NetSuite Custom Tool](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_162020236.html) that exposes your account's table schemas from the [Records Catalog](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_155929845760.html) to AI clients and integrations via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

## What This Does

Provides two functions accessible to AI assistants and external integrations:

- **`listTables`** - Search and list available NetSuite record types/tables
- **`getTableSchema`** - Get complete field definitions for any table

Perfect for building AI-powered integrations, automating SuiteQL query generation, or exploring your NetSuite data structure programmatically.

## Prerequisites

- NetSuite account with:
  - SuiteScript feature enabled
  - SuiteCloud Development Framework enabled
  - Custom Tools feature enabled (2024.2+)
  - Administrator or appropriate role permissions
- [SuiteCloud CLI installed](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558708810.html) (requires Node.js and Java)

## Installation

### 1. Install SuiteCloud CLI

Follow the [official installation guide](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558708810.html):

```bash
npm install -g @oracle/suitecloud-cli
```

### 2. Setup Project Authentication

```bash
git clone <repository-url>
cd netsuite-mcp-context-ql
suitecloud account:setup
```

Follow prompts to configure your NetSuite account credentials.

### 3. Validate and Deploy

```bash
suitecloud project:validate
suitecloud project:deploy
```

### 4. Create Schema Generator Suitelet

After deployment, you must create a Suitelet script record to generate the table schemas:

1. **Navigate to:** Customization → Scripting → Scripts → New
2. **Script File:** Select `/SuiteScripts/ContextQL/br_context_ql_create_shema_sl.js`
3. **Name:** "ContextQL Schema Generator" (or your preference)
4. **ID:** Leave as auto-generated or customize
5. **Save**

### 5. Deploy the Suitelet

1. Click **"Deploy Script"** on the script record
2. **Status:** Released
3. **Audience:** Administrator (or appropriate role)
4. **Save** the deployment
5. **Copy the external URL** from the deployment record - you'll need this to generate schemas

See [Script Deployment](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_0706024425.html) for more details.

### 6. Generate Schemas (Required Before Use)

1. Navigate to the Suitelet deployment URL from step 5
2. Click **"Generate Schemas"** button
3. Wait for completion (may take several minutes)

This creates:

- Individual JSON files for each table in `/SuiteScripts/ContextQL/TablesSchemas/`
- A `manifest.json` file indexing all available tables

**Important:** The Custom Tool will not work until schemas are generated.

## Testing

### Test via AI Client

If connected to an MCP-compatible AI client:

**Example prompts:**

```
"List all NetSuite tables with 'customer' in the name"
"Show me the schema for the transaction table"
"What fields are available on the item record?"
```

### Test Programmatically

The Custom Tool exposes two functions defined in [`customtool_context_ql.json`](src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.json):

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
      { "id": "id", "label": "Internal ID", "type": "INTEGER", "isAvailable": true },
      { "id": "entityid", "label": "Name", "type": "STRING", "isAvailable": true },
      // ... more fields
    ]
  }
}
```

## Architecture

```
NetSuite Records Catalog API
         ↓
Schema Generator Suitelet → File Cabinet (/SuiteScripts/ContextQL/TablesSchemas/)
         ↓
Custom Tool (customtool_context_ql.js)
         ↓
MCP / AI Clients / External Integrations
```

**Key Files:**

- `src/Objects/customtool_context_ql.xml` - Custom Tool object definition
- `src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.js` - Tool implementation
- `src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.json` - RPC schema (MCP interface)
- `src/FileCabinet/SuiteScripts/ContextQL/br_context_ql_create_shema_sl.js` - Schema generator Suitelet

## Maintenance

### Regenerate Schemas

NetSuite's Records Catalog changes when you add custom fields, records, or upgrade versions. Regenerate schemas by:

1. Navigating to the Suitelet URL
2. Clicking "Generate Schemas" again

### Update Custom Tool

After modifying code:

```bash
suitecloud project:validate
suitecloud project:deploy
```

## Notes

⚠️ **Work in Progress** - This project is functional but has areas for improvement (error handling, automation, performance).

- Only includes SuiteQL-compatible fields (`isAvailable: true` in Records Catalog)
- Requires File Cabinet read permissions for `/SuiteScripts/ContextQL/`
- Schema generation time varies based on account size and customization

## Useful Commands

```bash
suitecloud project:validate           # Validate project structure
suitecloud project:deploy             # Deploy to NetSuite
suitecloud file:list                  # List File Cabinet files
suitecloud object:import              # Import objects from account
```

## Resources

- [NetSuite Custom Tools Overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_162020236.html)
- [Records Catalog Documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_155929845760.html)
- [SuiteCloud CLI Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_155931263126.html)
- [Custom Tool API Guide](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0902023450.html)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Contributing

Contributions welcome! Open an issue or PR to improve this tool.
