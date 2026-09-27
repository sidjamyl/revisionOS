import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [file, pattern] = process.argv.slice(2);
if (!file || !pattern) throw new Error('Usage: node scripts/find-pdf.mjs path/to/file.pdf "phrase"');
const pdf = await getDocument({ data: new Uint8Array(await readFile(file)), useSystemFonts: true }).promise;
console.log(`${pdf.numPages} pages`);
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
  const content = await (await pdf.getPage(pageNumber)).getTextContent();
  const text = content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ');
  const index = text.toLowerCase().indexOf(pattern.toLowerCase());
  if (index >= 0) console.log(`Page ${pageNumber}: ${text.slice(Math.max(0, index - 60), index + pattern.length + 140)}`);
}
await pdf.cleanup();
