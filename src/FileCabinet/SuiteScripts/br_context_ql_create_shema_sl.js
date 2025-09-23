/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/file", "N/search", "N/ui/serverWidget"], function (
  file,
  search,
  ui,
) {
  function readFileCabinetAsString(id) {
    try {
      const f = file.load({ id });
      const contents = f.getContents();
      return contents;
    } catch (e) {
      throw e;
    }
  }
  const FOLDER_ID = 91202;
  const MANIFEST_NAME = "manifest.json";
  function findFileIdByName(name, folderId) {
    const s = search.create({
      type: "file",
      filters: [["name", "is", name], "AND", ["folder", "anyof", folderId]],
      columns: ["internalid"],
    });
    const r = s.run().getRange({ start: 0, end: 1 });
    return r && r.length ? r[0].getValue("internalid") : null;
  }
  function findManifestId() {
    return findFileIdByName(MANIFEST_NAME, FOLDER_ID);
  }
  function readManifest() {
    try {
      const id = findManifestId();
      if (!id) return null;
      const txt = readFileCabinetAsString(id);
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
      let html = readFileCabinetAsString("/SuiteScripts/context_ql_build_shema_index.html");
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
        // Find if already exists and delete
        const existingId = findFileIdByName(safeName, FOLDER_ID);
        if (existingId) {
          // requires delete permission in File Cabinet
          file.delete({ id: existingId });
        }
        const f = file.create({
          fileType: file.Type.JSON,
          name: safeName,
          contents,
          folder: FOLDER_ID,
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
