const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { download } = require('./utils');
const { connectDB } = require('./db');
const AlchemyModel = require('./model/alchemy');

const url = 'https://genshin.gg/alchemy/';

async function scrapeData() {
 try {
  await connectDB();
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const alchemyData = $('.rt-tbody').children();
  for (let i = 0; i < alchemyData.length; i++) {
   const alchemyArrtibutes = alchemyData[i].children[0];
   let alchemy = {};
   for (let j = 0; j < alchemyArrtibutes.children.length; j++) {
    let attribute = alchemyArrtibutes.children[j];
    if (j == 3) {
     alchemy.ingredients = [];
     const ele = attribute.children[0];
     for (let i = 0; i < ele.children.length; i++) {
      alchemy.ingredients.push(ele.children[i].children[0].data);
     }
    } else {
     while (attribute.children && attribute.children.length > 0)
      attribute = attribute.children[0];
     if (j == 0) {
      alchemy.name = attribute.attribs.alt;
      alchemy.image_url = attribute.attribs.src;
     } else if (j == 1) {
      alchemy.rarity = parseInt(
       new RegExp('rarity_(.*).png').exec(attribute.attribs.src)[1],
      );
     } else {
      alchemy.bonus = attribute.data;
     }
    }
   }

   if (
    !fs.existsSync(
     path.join('alchemyImages', `${alchemy.name.split(' ').join('_')}.png`),
    )
   ) {
    console.log('Getting image');
    await download(
     alchemy.image_url,
     `${alchemy.name.split(' ').join('_')}.png`,
     path.join('AlchemyImages'),
    );
   }
   alchemy.image_url = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/AlchemyImages/${alchemy.name
    .split(' ')
    .join('_')}.png`;
   alchemy = new AlchemyModel(alchemy);
   const data = await AlchemyModel.findOne({ name: alchemy.name });
   if (!data) {
    await alchemy.save();
   }
  }
 } catch (error) {
  console.log(error);
 }
 process.exit(-1);
}

scrapeData();
