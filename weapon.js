const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { download } = require('./utils');
const WeaponModel = require('./model/weapon');
const db = require('./db');

const url = 'https://genshin.gg/weapons/';

const weapons = [];
const weaponMapper = {};

async function scrapeData() {
 try {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const regexPattern = new RegExp('weapon_(.*).png');

  const weaponData = $('.rt-tbody').children();
  for (let i = 0; i < weaponData.length; i++) {
   const weaponArrtibutes = weaponData[i].children[0];
   let weapon = {};
   for (let j = 0; j < weaponArrtibutes.children.length; j++) {
    let attribute = weaponArrtibutes.children[j];
    while (attribute.children && attribute.children.length > 0)
     attribute = attribute.children[0];
    if (j == 0) {
     weapon.name = attribute.attribs.alt;
     weapon.image_url = attribute.attribs.src;
    } else if (j == 1) {
     weapon.type = regexPattern.exec(attribute.attribs.src)[1].toUpperCase();
     weaponMapper[weapon.type] = attribute.attribs.src;
    } else if (j == 2) {
     weapon.rarity = parseInt(
      new RegExp('rarity_(.*).png').exec(attribute.attribs.src)[1],
     );
    } else if (j == 3) {
     weapon.attack = parseInt(attribute.data);
    } else if (j == 4) {
     weapon.secondaryAttack = attribute.data;
    } else {
     weapon.drop = attribute.data;
    }
   }
   weapon.image_url = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/WeaponImages/${
    weapon.type
   }/${weapon.name.split(' ').join('_')}.png`;
   if (
    !fs.existsSync(
     path.join(
      'WeaponImages',
      weapon.type,
      `${weapon.name.split(' ').join('_')}.png`,
     ),
    )
   ) {
    console.log('Getting image');
    await download(
     weapon.image_url,
     `${weapon.name.split(' ').join('_')}.png`,
     path.join('WeaponImages', weapon.type),
    );
   }
   weapon = new WeaponModel({ ...weapon, ...weapons[weapon.name] });
   await weapon.save();
  }
 } catch (error) {
  console.log(error);
 }
 process.exit(-1);
}

const scrapeWeaponDesc = async (fn) => {
 const browser = await puppeteer.launch({ args: ['--start-fullscreen'] });

 const page = await browser.newPage();

 await page.goto(url, { waitUntil: 'networkidle2' });
 await console.log('User navigated to site');

 let tooltips = await page.$$('.table-image-wrapper');

 for (let tooltip of tooltips) {
  await tooltip.hover();
 }

 tooltips = await page.$$('.weapon-tooltip');

 for (let tooltip of tooltips) {
  let element = await tooltip.$('.weapon-tooltip-name');
  const name = await (await element.getProperty('innerText')).jsonValue();
  element = await tooltip.$('.weapon-tooltip-passive');
  const passive = await (await element.getProperty('innerText')).jsonValue();
  element = await tooltip.$('.weapon-tooltip-bonus');
  const passiveText = await (
   await element.getProperty('innerText')
  ).jsonValue();
  weapons[name] = {
   passive,
   passiveText,
  };
 }

 await browser.close();
 await console.log('Browser closed');
 fn();
};

scrapeWeaponDesc(scrapeData);
