const axios = require('axios');
const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');
const path = require('path');

const { connectDB } = require('./db');
const WeaponModel = require('./model/weapon');
const ArtifactModel = require('./model/artifact');
const MaterialModel = require('./model/material');
const { download } = require('./utils');

const url = 'https://genshin.gg/characters/amber/';

const vision = {};
const weapon = {};

//function to get skills
const getSkills = async (
 characterSkills,
 holderObject,
 character_intro,
 skillType,
) => {
 for (let i = 0; i < characterSkills.length; i++) {
  const skill = characterSkills[i];
  const skillTitle = skill.children[0].children[1].children[0].data;
  let image_url = skill.children[0].children[0].attribs.src;
  const skillName = skill.children[1].children[0].children[0].data;
  const skillDescription = skill.children[1].children[1].children;
  const description = {};

  let lastKey = null;
  let value = '';
  let data = [];

  for (let i = 0; i < skillDescription.length; i++) {
   const skill = skillDescription[i];
   if (skill.name === 'h3' || skill.name === 'h4') {
    const val = skill.children[0].data;
    description[val] = {};
    lastKey = val;
   } else if (skill.name === 'p' || skill.name === 'div') {
    description[lastKey].type = 'text';
    description[lastKey].value = [];
    let lastData;
    for (let i = 0; i < skill.children.length; i++) {
     if ((skill.children[i].name = 'text')) {
      lastData = skill.children[i].data;
      i++;
      while (i < skill.children.length && skill.children[i].name != 'br') {
       if (skill.children[i].name === 'span') {
        lastData += skill.children[i].children[0].data;
       } else {
        lastData += skill.children[i].data;
       }
       i++;
      }
      description[lastKey].value.push(lastData);
     }
    }
   } else if (skill.name === 'ul') {
    description[lastKey].type = 'list';
    description[lastKey].value = [];
    for (let i = 0; i < skill.children.length; i++) {
     let data = '';
     for (let j = 0; j < skill.children[i].children.length; j++) {
      if (skill.children[i].children[j].data) {
       data += skill.children[i].children[j].data;
      } else if (skill.children[i].children[j].children[0]) {
       data += skill.children[i].children[j].children[0].data;
      }
     }
     description[lastKey].value.push(data);
    }
   } else {
    if (!lastKey) {
     if (skill.name === 'br') {
      data.push(value);
      value = '';
     } else if (skill.name === 'span') {
      value += skill.children[0].data;
     } else {
      value += skill.data;
     }
    }
   }
  }
  if (!lastKey) {
   data.push(value);
   description.skillDescription = {};
   description.skillDescription.type = 'text';
   description.skillDescription.value = data;
  }

  await download(
   image_url,
   skillTitle + '.png',
   `Character/${character_intro.name}/${skillType}`,
  );

  image_url = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/Character/${character_intro.name}/${skillType}/${skillTitle}.png`;

  holderObject.push({
   skillTitle,
   image_url,
   skillName,
   description,
  });
 }
};

//fucntion to scrape the data
async function scrapeData() {
 const characterJson = {};
 try {
  await connectDB();
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

  await download(
   character_intro.image_url,
   character_intro.name + '.png',
   `Character/${character_intro.name}`,
  );

  character_intro.image_url =
   imageUrl = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/Character/${character_intro.name}/${character_intro.name}.png`;

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
   const materialName = material.children[1].children[0].data;
   let imageUrl = material.children[0].attribs.src;
   const dbMaterial = await MaterialModel.findOne({ name: materialName });
   if (!fs.existsSync(path.join('MaterialImages', `${materialName}.png`)))
    await download(imageUrl, materialName + '.png', 'MaterialImages');
   if (!dbMaterial) {
    //Agnidus%20Agate%20Sliver.png
    imageUrl = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/MaterialImages/${materialName}.png`;
    const newMaterial = new MaterialModel({
     name: materialName,
     image_url: imageUrl,
    });
    await newMaterial.save();
    character_materials.push(newMaterial._id);
   } else {
    character_materials.push(dbMaterial._id);
   }
  }

  //character build
  const character_build = {
   weapon_build: [],
   artifact_build: [],
  };
  const weaponBuild = characterIntro('.character-build')
   .children()
   .first()
   .children(':not(h2)');
  const artifactBuild = characterIntro('.character-build')
   .children()
   .last()
   .children(':not(h2)');

  for (let i = 0; i < weaponBuild.length; i++) {
   const weapon = weaponBuild[i];
   const weaponName = weapon.children[2].children[0].data;
   const { _id: weaponId } = await WeaponModel.findOne(
    { name: weaponName },
    { _id: 1 },
   );
   character_build.weapon_build.push({
    weaponId: weaponId.toString(),
    rank: i + 1,
   });
  }

  for (let i = 0; i < artifactBuild.length; i++) {
   const artifacts = [];
   const artifact = artifactBuild[i];
   const artifactName1 = artifact.children[1].children[1].children[0].data;
   const { _id: artifactId1 } = await ArtifactModel.findOne(
    { name: artifactName1 },
    { _id: 1 },
   );

   artifacts.push(artifactId1.toString());
   if (artifact.children[2]) {
    const artifactName2 = artifact.children[2].children[1].children[0].data;
    const { _id: artifactId2 } = await ArtifactModel.findOne(
     { name: artifactName2 },
     { _id: 1 },
    );
    artifacts.push(artifactId2.toString());
   }
   character_build.artifact_build.push({
    artifacts,
    value: artifacts.map(() => 4 / artifacts.length),
    rank: i + 1,
   });
  }

  //getting character stats
  const character_stats = [];
  const characterStats =
   characterIntro('.character-stats').children(':not(h2)');
  for (let i = 0; i < characterStats.length; i++) {
   const stat = characterStats[i];
   const statName = stat.children[0].children[0].data;
   let statValue = '';
   for (let i = 1; i < stat.children.length; i++) {
    statValue += stat.children[i].data;
   }
   character_stats.push({
    statName,
    statValue,
   });
  }

  //getting character talents
  const character_talent = [];
  const character_passives = [];
  const character_constellations = [];
  // normal_attack: {
  //   skill_name:""
  //   skill_description:[]
  // },
  // elemental_skill: {
  //   skill_name:""
  //   skill_description:[]
  // }
  // elemental_brust: {
  //   skill_name:""
  //   skill_description:[]
  // }

  let characterSkills = $('.character #talents').children(':not(h2)');
  await getSkills(characterSkills, character_talent, character_intro, 'Talent');
  characterSkills = $('.character #passives').children(':not(h2)');
  await getSkills(
   characterSkills,
   character_passives,
   character_intro,
   'Passive',
  );
  characterSkills = $('.character #constellations').children(':not(h2)');
  await getSkills(
   characterSkills,
   character_constellations,
   character_intro,
   'Constellation',
  );

  characterJson.character_intro = character_intro;
  characterJson.character_materials = character_materials;
  characterJson.character_build = character_build;
  characterJson.character_stats = character_stats;
  characterJson.character_talent = character_talent;
  characterJson.character_passives = character_passives;

  console.log(character_constellations);
  for (let i = 0; i < character_constellations.length; i++) {
   console.log(character_constellations[i].description);
  }
  // process.exit(-1);
 } catch (error) {
  console.log(error);
  process.exit(0);
 }
}

scrapeData();
