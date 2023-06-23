const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');

const { download } = require('./utils');

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
   const weapon = {};
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
     weapon.attack = attribute.data;
    } else if (j == 4) {
     weapon.secondaryAttack = attribute.data;
    } else {
     weapon.drop = attribute.data;
    }
   }
   weapons.push(weapon);
   if (
    !fs.existsSync(
     path.join(
      'WeaponImages',
      weapon.type,
      `${weapon.name.split(' ').join('_')}.png`,
     ),
    )
   ) {
    download(
     weapon.image_url,
     `${weapon.name.split(' ').join('_')}.png`,
     path.join('WeaponImages', weapon.type),
    );
   }
  }
 } catch (error) {
  console.log(error);
 }
}
scrapeData();
