import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';

const main = async () => {
  const inputFile = process.argv[2];
  if (!fs.existsSync(inputFile) || path.extname(inputFile) !== '.png') {
    console.error('Please provide a valid PNG file as an argument.');
    process.exit(1);
  }

  const worker = await createWorker('ron');

  const { data: { text } } = await worker.recognize(inputFile);

  const outputFile = path.join(path.dirname(inputFile), path.basename(inputFile, '.png') + '.txt');
  fs.writeFileSync(outputFile, text);

  console.log(`Text has been written to ${outputFile}`);

  await worker.terminate();
};

main().catch(console.error);