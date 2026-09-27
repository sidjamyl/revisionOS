import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const directory = '.data/imports';
for (const file of (await readdir(directory)).filter(name => name.includes('-exam-')).sort()) {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(join(directory, file))), useSystemFonts: true }).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  const text = content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ');
  console.log(`${file} | ${pdf.numPages} pages | ${text.slice(0, 270)}`);
  await pdf.cleanup();
}
