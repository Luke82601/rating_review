const fs = require("fs");
const Pool = require("pg").Pool;
const csv = require("fast-csv");
const path = require('path');
const parse = require('csv-parse');

const origin = path.join(__dirname, './csv/reviews.csv');
const destination = path.join(__dirname, './csv/reviewsCleaned.csv');

fs.writeFileSync(destination, '');

let readStream = fs.createReadStream(origin);
let writeStream = fs.createWriteStream(destination, { flags: 'a' });
let csvStream = csv.format({ headers: true });
csvStream.pipe(writeStream);

readStream
  .pipe(parse())
  .on("data", (row,) => {
    const newRow = { ...row };
    if (!newRow[' helpfulness']) {
      newRow[' helpfulness'] = newRow[' response'];
      newRow[' response'] = newRow[' reviewer_email'];
      newRow[' reviewer_email'] = newRow[' reviewer_name'];
      newRow[' reviewer_name'] = newRow[' reported'];
      newRow[' reported'] = newRow[' recommend'];
      newRow[' recommend'] = newRow[' rating'];
      newRow[' rating'] = newRow[' body'];
      newRow[' body'] = newRow[' summary'];
      newRow[' summary'] = newRow[' date'];
      newRow[' date'] = newRow[' rating'];
      newRow[' rating'] = ''
    }
    csvStream.write(newRow);
  })
  .on("end", () => {
    csvStream.end();
    console.log('CSV Review successfully loaded');
  });

csvStream.pipe(csvStream);
