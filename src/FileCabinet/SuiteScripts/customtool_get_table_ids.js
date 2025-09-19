/**
 * customtool_get_tableIds.js
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

define(["N/file"], function (nFile) {
  const MANIFEST_PATH = "/SuiteScripts/Tables Schemas/manifest.json";
  const SCHEMAS_FOLDER = "/SuiteScripts/Tables Schemas/";
  
  return {
    listTables: function (args) {
      try {
        // Try loading by file cabinet path
        const manifestFile = nFile.load({
          id: MANIFEST_PATH,
        });

        const manifestText = manifestFile.getContents();

        try {
          manifestJson = JSON.parse(manifestText);
        } catch (e) {
          throw new Error(
            `El archivo ${MANIFEST_PATH} no contiene JSON válido: ${e.message}`,
          );
        }
        const rawTables = Array.isArray(manifestJson.tables)
          ? manifestJson.tables
          : [];

        // Apply search filter if provided
        let filteredTables = rawTables;
        if (args.search && args.search.trim()) {
          const searchTerm = args.search.trim().toLowerCase();
          filteredTables = rawTables.filter(table => {
            const id = (table.id || '').toLowerCase();
            const label = (table.label || '').toLowerCase();
            return id.includes(searchTerm) || label.includes(searchTerm);
          });
        }

        // Apply limit if provided
        let limitedTables = filteredTables;
        if (args.limit && !isNaN(parseInt(args.limit))) {
          const limitNum = parseInt(args.limit);
          limitedTables = filteredTables.slice(0, limitNum);
        }

        return {
          tables: limitedTables,
          totalFound: filteredTables.length,
          totalInManifest: rawTables.length,
        };
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        return {
          tables: [],
          error: `Failed to load table schema: ${errorMessage}. Please ensure the manifest file exists at ${MANIFEST_PATH}.`,
        };
      }
    },

    getTableSchema: function (args) {
      try {
        if (!args.id || !args.id.trim()) {
          return {
            error: "Table ID is required"
          };
        }

        const tableId = args.id.trim();
        const tableFilePath = SCHEMAS_FOLDER + tableId + ".json";

        try {
          const tableFile = nFile.load({
            id: tableFilePath,
          });

          const tableContent = tableFile.getContents();
          
          try {
            const tableDetails = JSON.parse(tableContent);
            return {
              id: tableId,
              details: tableDetails
            };
          } catch (parseError) {
            return {
              error: `Invalid JSON in table file ${tableId}.json: ${parseError.message}`
            };
          }

        } catch (fileError) {
          return {
            error: `Table file not found: ${tableId}.json. Please ensure the file exists at ${tableFilePath}`
          };
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        return {
          error: `Failed to load table details: ${errorMessage}`
        };
      }
    },
  };
});
