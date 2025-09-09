/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { readFileCabinetAsString } from '../Libraries/FileHelper';
import * as search from 'N/search';
import type { ManifestTable } from 'Types';

const FOLDER_ID = 91202;
const MANIFEST_NAME = 'manifest.json';

interface Response {
    tables: Array<ManifestTable>
    error?: string
}

export function getTables(): Response {
    const manifestSearch = search.create({
        type: 'file',
        filters: [
            ['name', 'is', MANIFEST_NAME], 'AND',
            ['folder', 'anyof', FOLDER_ID]
        ],
        columns: ['internalid']
    });

    const result = manifestSearch.run().getRange({ start: 0, end: 1 });
    if (!result || result.length === 0) {
        return {
            tables: [],
            error: "There is not a table schema built. "
        }
    }

    const manifestId = String(result[0].getValue({ name: 'internalid' }));

    const manifestText = readFileCabinetAsString(manifestId);

    let manifestJson: any;
    try {
        manifestJson = JSON.parse(manifestText);
    } catch (e) {
        throw new Error(`El archivo ${MANIFEST_NAME} no contiene JSON válido: ${(e as Error).message}`);
    }

    const rawTables = Array.isArray(manifestJson.tables) ? manifestJson.tables : [];

    return {
        tables: rawTables,
    }
}