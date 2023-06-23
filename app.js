const axios = require('axios');
const cheerio = require('cheerio');
const pretty = require('pretty');

const url = 'https://genshin.gg/characters/amber/';

const vision = {};
const weapon = {};

//fucntion to scrape the data
async function scrapeData() {
 const characterJson = {};
 try {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const characterIntro = cheerio.load(
   $('.character').children().first().html(),
  );
  // const characterSkills = characterIntro("#talents")

  const character_intro = {};

  //getting character name and image_url
  const imageDiv = characterIntro('.character-portrait');
  character_intro.image_url = imageDiv.attr('src');
  character_intro.name = imageDiv.attr('alt');

  //getting character vision material
  const elementalImgDiv = characterIntro(
   '.character-header .character-title .character-element',
  );
  character_intro.vision = elementalImgDiv.attr('alt');
  vision[character_intro.vision] = elementalImgDiv.attr('src');

  //getting character weapon and role
  const weaponDivImg = characterIntro(
   '.character-header .character-path .character-path-icon',
  );
  character_intro.weapon = weaponDivImg.attr('alt');
  weapon[character_intro.weapon] = weaponDivImg.attr('src');
  character_intro.role = characterIntro(
   '.character-header .character-role',
  ).text();

  const characterMaterials = characterIntro('.character-materials').children(
   ':not(h2)',
  );

  const character_materials = [];
  //a list of upgradable materials
  for (let i = 0; i < characterMaterials.length; i++) {
   const material = characterMaterials[i];
   character_materials.push({
    name: material.children[1].children[0].data,
    image_url: material.children[0].attribs.src,
   });
  }
  characterJson.character_intro = character_intro;
  characterJson.character_materials = character_materials;

  console.log(characterJson);
 } catch (error) {
  console.log(error);
 }
}

scrapeData();
