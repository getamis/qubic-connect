/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const fs = require('fs');

const targetPath = process.argv[2];

const result = dotenv.config({ path: targetPath });

if (result.error) {
  throw result.error;
}

const output = Object.entries(result.parsed)
  .map(([key, value]) => {
    return `window.${key}="${value}";`;
  })
  .join('\n');

fs.writeFileSync('env.js', output);
