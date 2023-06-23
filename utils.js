const fs = require('fs');
const path = require('path');
const axios = require('axios');

const download = (uri, fileName, folderName) => {
 if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName, { recursive: true });
 }
 axios({
  method: 'get',
  url: uri,
  responseType: 'stream',
 }).then((response) => {
  response.data.pipe(fs.createWriteStream(path.join(folderName, fileName)));
 });
};

module.exports = {
 download,
};
