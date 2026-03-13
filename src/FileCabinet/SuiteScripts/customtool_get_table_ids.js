/**
 * customtool_context_ql.js
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

define(["N/file", "N/log"], function (nFile, log) {
  const MANIFEST_PATH = "/SuiteScripts/ContextQL/TablesSchemas/manifest.json";
  const SCHEMAS_FOLDER = "/SuiteScripts/ContextQL/TablesSchemas/";

  return {
    listTables: async function (args) {
      try {
        const manifestFile = nFile.load({
          id: MANIFEST_PATH,
        });

        const manifestText = manifestFile.getContents();
        let manifestJson;

        try {
          manifestJson = JSON.parse(manifestText);
        } catch (e) {
          throw new Error(
            `The file ${MANIFEST_PATH} does not contain valid JSON: ${e.message}`,
          );
        }

        const rawTables = Array.isArray(manifestJson.tables)
          ? manifestJson.tables
          : [];

        let filteredTables = rawTables;
        if (args.search && args.search.trim()) {
          const searchTerm = args.search.trim().toLowerCase();
          filteredTables = rawTables.filter((table) => {
            const id = (table.id || "").toLowerCase();
            const label = (table.label || "").toLowerCase();
            return id.includes(searchTerm) || label.includes(searchTerm);
          });
        }

        let limitedTables = filteredTables;
        if (args.limit && !isNaN(parseInt(args.limit))) {
          const limitNum = parseInt(args.limit);
          limitedTables = filteredTables.slice(0, limitNum);
        }

        return JSON.stringify({
          tables: limitedTables,
          totalFound: filteredTables.length,
          totalInManifest: rawTables.length,
        });
      } catch (e) {
        log.error({
          title: "listTables error",
          details: e,
        });
        return JSON.stringify({
          tables: [],
          error: `Failed to load table schema: ${e.message || String(e)}. Please ensure the manifest file exists at ${MANIFEST_PATH}.`,
        });
      }
    },

    getTableSchema: async function (args) {
      try {
        if (!args.id || !args.id.trim()) {
          return JSON.stringify({
            error: "Table ID is required",
          });
        }

        const tableId = args.id.trim();
        const tableFilePath = SCHEMAS_FOLDER + tableId.toLowerCase() + ".json";

        try {
          const tableFile = nFile.load({
            id: tableFilePath,
          });

          const tableContent = tableFile.getContents();

          try {
            const tableDetails = JSON.parse(tableContent);
            return JSON.stringify({
              id: tableId,
              details: tableDetails,
            });
          } catch (parseError) {
            return JSON.stringify({
              error: `Invalid JSON in table file ${tableId.toLowerCase()}.json: ${parseError.message}`,
            });
          }
        } catch (fileError) {
          return JSON.stringify({
            error: `Table file not found: ${tableId.toLowerCase()}.json. Please ensure the file exists at ${tableFilePath}`,
          });
        }
      } catch (e) {
        log.error({
          title: "getTableSchema error",
          details: e,
        });
        return JSON.stringify({
          error: `Failed to load table details: ${e.message || String(e)}`,
        });
      }
    },
  };
});
