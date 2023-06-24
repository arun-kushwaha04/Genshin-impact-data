const fs = require('fs');
const path = require('path');
const axios = require('axios');

const download = (uri, fileName, folderName) => {
 return new Promise((resolve, reject) => {
  if (!fs.existsSync(folderName)) {
   fs.mkdirSync(folderName, { recursive: true });
  }
  axios({
   method: 'get',
   url: uri,
   responseType: 'stream',
  })
   .then(async (response) => {
    await response.data.pipe(
     fs.createWriteStream(path.join(folderName, fileName)),
    );
    resolve();
   })
   .catch((err) => {
    console.log(err), reject(err);
   });
 });
};

module.exports = {
 download,
};
