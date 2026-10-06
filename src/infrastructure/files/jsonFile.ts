/**
 * Moving JSON files in and out of the app: write one to the cache and
 * hand it to the OS share sheet, or let the user pick one and read it.
 * The only place that touches the native file modules.
 */
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** MIME type of every file this module writes or accepts. */
const JSON_MIME = 'application/json';

/**
 * Write `contents` to `<cache>/<fileName>` and open the share sheet for
 * it. Resolves once the sheet closes. Throws when sharing is unavailable.
 */
export async function shareJsonFile(fileName: string, contents: string, dialogTitle: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(contents);
  await Sharing.shareAsync(file.uri, { mimeType: JSON_MIME, UTI: 'public.json', dialogTitle });
}

/** Let the user pick a JSON file and read it; `null` when they cancel. */
export async function pickJsonFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: JSON_MIME, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset === undefined) return null;
  return new File(asset.uri).text();
}
