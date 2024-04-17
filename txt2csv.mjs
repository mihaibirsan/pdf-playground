import fs from 'fs';
import readline from 'readline';
import csvWriter from 'csv-writer';

const inputFile = process.argv[2];
const outputFile = inputFile.replace('.txt', '.csv');

// Example: data/lidl/2024.02.17_2600017983202402177163.jpg.csv
const discountPattern = /^DISCOUNT (\d+,\d{2})-(A|B|C|D)$/;
// Example: data/lidl/2024.02.20_26000157842024022023795.jpg.txt
const followOnPattern = /^(\d+,\d{2}) ?(A|B|C|D)$/;
const startPattern = /^Lei$/;
const endPattern = /^SUBTOTAL /;
// Example: data/lidl/2024.02.09_26000343862024020923426.jpg.csv:7
const dataPattern = /^(.+) (\d+,\d{2}) ?(A|B|C|D)$/;

const readStream = fs.createReadStream(inputFile);
const writeStream = csvWriter.createArrayCsvWriter({
    path: outputFile,
    header: ['Produs', 'Preț', 'Data', 'Comerciant']
});

function stringSafeAddition(a, b) {
    const aFloat = Number.parseFloat(a.replace(',', '.'));
    const bFloat = Number.parseFloat(b.replace(',', '.'));
    return (aFloat + bFloat).toLocaleString('en-US', {minimumFractionDigits: 2});
}

const rl = readline.createInterface({
    input: readStream,
    output: process.stdout,
    terminal: false
});

let startPatternMatched = false;
const records = [];

const comerciant = 'Lidl';
const date = inputFile.match(/\d{4}\.\d{2}\.\d{2}/)[0].replaceAll('.', '-');

rl.on('line', (line) => {
    if (!startPatternMatched && line.match(startPattern)) {
        startPatternMatched = true;
    }

    if (startPatternMatched && line.match(endPattern)) {
        // Example: data/lidl/2024.02.26_26000157822024022646732.jpg.csv:10
        const subtotalData = line.match(/\d+, ?\d{2}$/);
        if (subtotalData) {
            const subtotal = Number.parseInt(subtotalData[0].replaceAll(/[, ]/g, ''));
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
        rl.close();
        writeStream.writeRecords(records)
            .then(() => console.log(`CSV written to ${outputFile}`));
    }

    if (startPatternMatched && !line.match(endPattern)) {
        const data = line.match(dataPattern);
        if (data) {
            const price = data[2].replace(',', '.');
            records.push([data[1], price, date, comerciant]);
        }
        const followOn = line.match(followOnPattern);
        if (followOn) {
            const followOnRecord = records.at(-1);
            followOnRecord[1] = stringSafeAddition(followOnRecord[1], followOn[1]);
        }
        const discount = line.match(discountPattern);
        if (discount) {
            const discountedRecord = records.at(-1);
            discountedRecord[1] = stringSafeAddition(discountedRecord[1], `-${discount[1]}`);
        }
    }
});