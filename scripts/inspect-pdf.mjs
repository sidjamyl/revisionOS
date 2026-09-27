import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [file, firstArg, lastArg] = process.argv.slice(2);
if (!file) throw new Error('Usage: node scripts/inspect-pdf.mjs path/to/file.pdf [firstPage] [lastPage]');
const pdf = await getDocument({ data: new Uint8Array(await readFile(file)), useSystemFonts: true }).promise;
const first = Math.max(1, Number(firstArg ?? 1));
const last = Math.min(pdf.numPages, Number(lastArg ?? pdf.numPages));
console.log(`Pages: ${pdf.numPages}`);
for (let pageNumber = first; pageNumber <= last; pageNumber++) {
  const content = await (await pdf.getPage(pageNumber)).getTextContent();
  console.log(`\n--- PDF page ${pageNumber} ---\n`);
  console.log(content.items.map(item => 'str' in item ? item.str : '').join(' '));
}
await pdf.cleanup();
