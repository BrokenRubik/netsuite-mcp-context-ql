# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NetSuite SuiteCloud Development Framework (SDF) project that implements a ContextQL custom tool for NetSuite. It generates and manages table schemas from NetSuite's Records Catalog API.

## Key Architecture

### Custom Tool Structure
- **Custom Tool Definition**: `src/Objects/customtool_context_ql.xml` - Defines the NetSuite custom tool configuration
- **Tool Implementation**: `src/FileCabinet/SuiteScripts/ContextQL/customtool_get_table_ids.js` - Implements `listTables` and `getTableSchema` functions
- **RPC Schema**: `src/FileCabinet/SuiteScripts/ContextQL/customtool_context_ql.json` - Defines the tool's API interface

### Schema Generation
- **Suitelet**: `src/FileCabinet/SuiteScripts/ContextQL/br_context_ql_create_shema_sl.js` - Handles schema generation from Records Catalog
- **HTML Interface**: `src/FileCabinet/SuiteScripts/ContextQL/br_context_ql_build_shema_index.html` - UI for triggering schema generation
- **Output Location**: `/SuiteScripts/ContextQL/TablesSchemas/` - Where generated schema JSON files are stored

### File Paths Convention
All file operations use absolute paths from the File Cabinet root:
- Main folder: `/SuiteScripts/ContextQL`
- Schemas folder: `/SuiteScripts/ContextQL/TablesSchemas`
- Manifest file: `/SuiteScripts/ContextQL/TablesSchemas/manifest.json`

## Common Development Commands

### SuiteCloud CLI Commands
```bash
# Validate project
suitecloud project:validate

# Deploy to NetSuite account
suitecloud project:deploy

# Import objects from account
suitecloud object:import

# List files in account
suitecloud file:list
```

### Project Structure
- `src/FileCabinet/` - Contains all SuiteScript files
- `src/Objects/` - Contains NetSuite object definitions (custom tools, etc.)
- `src/manifest.xml` - Project manifest
- `src/deploy.xml` - Deployment configuration
- `suitecloud.config.js` - SuiteCloud configuration
- `project.json` - Project authentication configuration

## Important Notes

- The project uses NetSuite's Records Catalog API to dynamically generate table schemas
- Schema files are filtered to only include SuiteQL-relevant fields (isAvailable: true)
- The custom tool exposes two main functions accessible via MCP or other integrations:
  - `listTables`: Search and list available NetSuite tables
  - `getTableSchema`: Get detailed field schema for a specific table
- All folders referenced in file paths are created automatically during deployment