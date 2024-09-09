/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const { calculateCommissions } = require('./utils');

// Read the input file and process the data
const inputFile = process.argv[2];
const filePath = path.resolve(__dirname, inputFile);
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading input file:', err);
    return;
  }

  const operations = JSON.parse(data);
  const commissions = calculateCommissions(operations);
  commissions.forEach((fee) => console.log(fee));
});
