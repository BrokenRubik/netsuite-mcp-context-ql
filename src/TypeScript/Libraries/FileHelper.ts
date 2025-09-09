import * as file from 'N/file';
import * as log from 'N/log';

export function readFileCabinetAsString(id: number | string): string {
  try {
    const f = file.load({ id });
    const contents = f.getContents();
    log.debug({ title: 'File loaded', details: `id=${id}, name=${f.name}, type=${f.fileType}` });
    return contents;
  } catch (e: any) {
    log.error({ title: 'Error loading file', details: `id=${id} - ${e.name || e.message}` });
    throw e;
  }
}