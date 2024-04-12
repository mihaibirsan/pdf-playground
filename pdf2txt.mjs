import fs from "fs";
import PDFParser from "pdf2json";

const filename = process.argv[2];

const pdfParser = new PDFParser(this,1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFile(filename.replace('.pdf', '.txt'), pdfParser.getRawTextContent(), ()=>{console.log("Done.");});
});

pdfParser.loadPDF(filename);
