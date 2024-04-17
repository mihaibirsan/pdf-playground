import fs from 'fs';
import readline from 'readline';
import csvWriter from 'csv-writer';

const inputFile = process.argv[2];
const outputFile = inputFile.replace('.txt', '.csv');

const startPattern = / RON$/;
const endPattern = /^Total /;
const dataPattern = /^(.+) (\d+,\d{2})$/;
const datePattern = /^Data: ?(\d{2})\.?(\d{2})\.?(\d{4})/;

const readStream = fs.createReadStream(inputFile);
const writeStream = csvWriter.createArrayCsvWriter({
    path: outputFile,
    header: ['Produs', 'Preț', 'Data', 'Comerciant']
});

const rl = readline.createInterface({
    input: readStream,
    output: process.stdout,
    terminal: false
});

let startPatternMatched = false;
let endPatternMatched = false;
let datePatternMatched = false;
const records = [];

const comerciant = 'Kaufland';

rl.on('line', (line) => {
    if (!startPatternMatched && line.match(startPattern)) {
        startPatternMatched = true;
    }

    if (startPatternMatched && line.match(endPattern)) {
        endPatternMatched = true;
        const subtotalData = line.match(/\d+,\d{2}$/);
        if (subtotalData) {
            const subtotal = Number.parseInt(subtotalData[0].replace(',', ''));
            const checksum = records.reduce(
                (acc, record) => acc + Number.parseFloat(record[1].replace('.', '')),
                0
            );
            
            if (subtotal === checksum) {
                console.log('\x1b[32m', `PASS`, '\x1b[0m', ` Subtotal: ${subtotal}, Checksum: ${checksum}`);
            } else {
                console.log('\x1b[31m', `FAIL`, '\x1b[0m', ` Subtotal: ${subtotal}, Checksum: ${checksum}`);
            }
        }
    }

    if (endPatternMatched && line.match(datePattern)) {
        datePatternMatched = true;
        const date = line.match(datePattern).slice(1).join('-');
        records.forEach(record => record.push(date, comerciant));
        rl.close();
        writeStream.writeRecords(records)
            .then(() => console.log(`CSV written to ${outputFile}`));
    }

    if (startPatternMatched && !endPatternMatched && !line.match(endPattern)) {
        const data = line.match(dataPattern);
        if (data) {
            const price = data[2].replace(',', '.');
            records.push([data[1], price]);
        }
    }
});

rl.on('close', () => {
    if (!datePatternMatched) {
        console.error('\x1b[31m', `FAIL`, '\x1b[0m', `Date pattern not matched for ${inputFile}`);
    }
});