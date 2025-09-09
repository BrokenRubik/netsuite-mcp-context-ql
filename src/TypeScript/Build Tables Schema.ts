/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

import { EntryPoints } from 'N/types'
import * as file from 'N/file';
import * as search from 'N/search';
import * as ui from 'N/ui/serverWidget';
import { readFileCabinetAsString } from './Libraries/FileHelper';

const FOLDER_ID = 91202;
const MANIFEST_NAME = 'manifest.json';

interface ManifestBody {
  lastGenerated: string;
}

function findFileIdByName(name: string, folderId: number): string | null {
  const s = search.create({
    type: 'file',
    filters: [
      ['name', 'is', name], 'AND',
      ['folder', 'anyof', folderId]
    ],
    columns: ['internalid']
  });
  const r = s.run().getRange({ start: 0, end: 1 });
  return r && r.length ? (r[0].getValue('internalid') as string) : null;
}

function findManifestId(): string | null {
  return findFileIdByName(MANIFEST_NAME, FOLDER_ID);
}

function readManifest(): ManifestBody | null {
  try {
    const id = findManifestId();
    if (!id) return null;
    const txt = readFileCabinetAsString(id)
    const obj = JSON.parse(txt) as ManifestBody;
    return obj;
  } catch (e) {
    return null;
  }
}

export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
  if (context.request.method === 'GET') {
    const manifest = readManifest();
    const lastMsg = manifest
      ? ('Último esquema generado: <b>' + manifest.lastGenerated + '</b>')
      : 'Nunca generado';

    const form = ui.createForm({ title: 'Generar catálogo (Records Catalog) → File Cabinet' });

    let html = readFileCabinetAsString(866267)

    html = html.replaceAll("%LAST_MSG%", lastMsg);

    const fld = form.addField({
      id: 'custpage_html',
      type: ui.FieldType.INLINEHTML,
      label: ' '
    });
    fld.defaultValue = html;

    context.response.writePage(form);
    return;
  }

  // POST: guarda archivos (borra si existe)
  try {
    const body = (context.request.body || '{}') as string;
    const data = JSON.parse(body);

    if (data.action === 'save' || data.action === 'saveManifest') {
      const contents: string = data.json || '{}';
      const rawName: string = data.name || (data.action === 'saveManifest' ? MANIFEST_NAME : 'record.json');
      const safeName = rawName.replace(/[^a-z0-9._-]/gi, '_');

      // Buscar si ya existe y borrar
      const existingId = findFileIdByName(safeName, FOLDER_ID);
      if (existingId) {
        // requiere permiso de delete en File Cabinet
        file.delete({ id: existingId });
      }

      const f = file.create({
        fileType: file.Type.JSON,
        name: safeName,
        contents,
        folder: FOLDER_ID,
        isOnline: false
      });
      const id = f.save();

      context.response.write({
        output: JSON.stringify({ ok: true, fileId: id, name: safeName })
      });
      return;
    }

    context.response.write({ output: JSON.stringify({ ok: false, msg: 'Unknown action' }) });
  } catch (e: any) {
    context.response.write({
      output: JSON.stringify({ ok: false, error: e.message || String(e) })
    });
  }
}