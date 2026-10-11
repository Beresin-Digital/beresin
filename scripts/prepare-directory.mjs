import { mkdir, writeFile } from 'node:fs/promises';

const started = performance.now();
await mkdir('.data', { recursive: true });
try {
  const { directory } = await import('../src/lib/directory/data.ts');
  const report = { ...directory.report, normalizationMs: Math.round(performance.now() - started) };
  await writeFile('.data/directory-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(`Directory: ${report.accepted} accepted, ${report.duplicates} duplicates, ${report.invalidFields.length} invalid fields (${report.normalizationMs} ms).`);
} catch (error) {
  await writeFile('.data/directory-report.json', JSON.stringify({ status: 'failed', error: error.message }, null, 2) + '\n');
  throw error;
}
