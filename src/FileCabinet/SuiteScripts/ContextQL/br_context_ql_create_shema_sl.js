/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/file", "N/search", "N/ui/serverWidget"], function (
  file,
  search,
  ui,
) {
  const SCHEMAS_FOLDER = "/SuiteScripts/ContextQL/TablesSchemas";
  const MANIFEST_NAME = "manifest.json";
  const MANIFEST_PATH = SCHEMAS_FOLDER + "/" + MANIFEST_NAME;

  function readFileCabinetAsString(id) {
    try {
      const f = file.load({ id });
      const contents = f.getContents();
      return contents;
    } catch (e) {
      throw e;
    }
  }

  function readManifest() {
    try {
      const manifestFile = file.load({ id: MANIFEST_PATH });
      const txt = manifestFile.getContents();
      const obj = JSON.parse(txt);
      return obj;
    } catch (e) {
      return null;
    }
  }
  function onRequest(context) {
    if (context.request.method === "GET") {
      const manifest = readManifest();
      const lastMsg = manifest
        ? "Last schema generated: <b>" + manifest.lastGenerated + "</b>"
        : "Never generated";
      const form = ui.createForm({
        title: "Generate Catalog (Records Catalog) → File Cabinet",
      });
      let html = readFileCabinetAsString(
        "/SuiteScripts/ContextQL/br_context_ql_build_shema_index.html",
      );
      html = html.replaceAll("%LAST_MSG%", lastMsg);
      const fld = form.addField({
        id: "custpage_html",
        type: ui.FieldType.INLINEHTML,
        label: " ",
      });
      fld.defaultValue = html;
      context.response.writePage(form);
      return;
    }
    // POST: saves files (deletes if exists)
    try {
      const body = context.request.body || "{}";
      const data = JSON.parse(body);
      if (data.action === "save" || data.action === "saveManifest") {
        const contents = data.json || "{}";
        const rawName =
          data.name ||
          (data.action === "saveManifest" ? MANIFEST_NAME : "record.json");
        const safeName = rawName.replace(/[^a-z0-9._-]/gi, "_");

        // Build full file path
        const filePath = SCHEMAS_FOLDER + "/" + safeName;

        // Try to delete existing file if it exists
        try {
          file.delete({ id: filePath });
        } catch (e) {
          // File doesn't exist, that's fine
        }

        // Get the folder ID for TablesSchemas folder
        const folderSearch = search.create({
          type: "folder",
          filters: [["name", "is", "TablesSchemas"]],
          columns: ["internalid"],
        });
        const folderResult = folderSearch.run().getRange({ start: 0, end: 1 });

        if (!folderResult || !folderResult.length) {
          throw new Error(
            "TablesSchemas folder not found. Please ensure it exists at /SuiteScripts/ContextQL/TablesSchemas",
          );
        }

        const folderId = folderResult[0].getValue("internalid");

        // Create new file using folder ID
        const f = file.create({
          fileType: file.Type.JSON,
          name: safeName,
          contents,
          folder: folderId,
          isOnline: false,
        });
        const id = f.save();
        context.response.write({
          output: JSON.stringify({ ok: true, fileId: id, name: safeName }),
        });
        return;
      }
      context.response.write({
        output: JSON.stringify({ ok: false, msg: "Unknown action" }),
      });
    } catch (e) {
      context.response.write({
        output: JSON.stringify({ ok: false, error: e.message || String(e) }),
      });
    }
  }
  return {
    onRequest,
  };
});
