const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { download } = require('./utils');
const db = require('./db');
const ArtifactModel = require('./model/artifact');

const url = 'https://genshin.gg/artifacts/';

const weapons = [];
const weaponMapper = {};

async function scrapeData() {
 try {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const artifactData = $('.rt-tbody').children();
  for (let i = 0; i < artifactData.length; i++) {
   const artifactArrtibutes = artifactData[i].children[0];
   let artifact = {};
   for (let j = 0; j < artifactArrtibutes.children.length; j++) {
    let attribute = artifactArrtibutes.children[j];
    while (attribute.children && attribute.children.length > 0)
     attribute = attribute.children[0];
    if (j == 0) {
     artifact.name = attribute.attribs.alt;
     artifact.image_url = attribute.attribs.src;
    } else if (j == 1) {
     artifact.rarity = parseInt(
      new RegExp('rarity_(.*).png').exec(attribute.attribs.src)[1],
     );
    } else if (j == 2) {
     artifact['2_piece_bonus'] = attribute.data;
    } else {
     artifact['4_piece_bonus'] = attribute.data;
    }
   }

   if (
    !fs.existsSync(
     path.join('ArtifactImages', `${artifact.name.split(' ').join('_')}.png`),
    )
   ) {
    console.log('Getting image');
    await download(
     artifact.image_url,
     `${artifact.name.split(' ').join('_')}.png`,
     path.join('ArtifactImages'),
    );
   }
   artifact.image_url = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/ArtifactImages/${artifact.name
    .split(' ')
    .join('_')}.png`;
   artifact = new ArtifactModel(artifact);
   const data = await ArtifactModel.findOne({ name: artifact.name });
   if (!data) {
    await artifact.save();
   }
  }
 } catch (error) {
  console.log(error);
 }
 process.exit(-1);
}

setTimeout(scrapeData, 2500);
