import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

async function pdfToPng(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfDoc = await getDocument(data).promise;
  const page = await pdfDoc.getPage(1);
  
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
  
  const image = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(pdfPath.replace('.pdf', '.png'), Buffer.from(image, 'base64'));
}

// Call the function with the PDF file path
pdfToPng(process.argv[2]);