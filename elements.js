const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');
const fs = require('fs');

const ElementModel = require('./model/element');
const { download } = require('./utils');
const { connectDB } = require('./db');
const ElementReactionModel = require('./model/elementReaction');

const elementalId = {};

const getElementId = async () => {
 const elements = await ElementModel.find({});
 for (let i = 0; i < elements.length; i++) {
  const element = elements[i];
  elementalId[element.name] = element._id;
 }
};

const elements = async () => {
 await connectDB();
 const images = [
  'https://rerollcdn.com/GENSHIN/Elements/Element_Electro.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Hydro.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Pyro.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Cryo.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Anemo.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Geo.png',
  'https://rerollcdn.com/GENSHIN/Elements/Element_Dendro.png',
 ];
 for (let i = 0; i < images.length; i++) {
  image = images[i];
  const name = new RegExp('Element_(.*).png').exec(image)[1];
  let element = { name };
  if (!fs.existsSync(path.join('Elements', 'Element', `${name}.png`))) {
   console.log('Getting image');
   download(image, `${name}.png`, path.join('Elements', 'Element'));
  }
  element.image_url = `https://raw.githubusercontent.com/arun-kushwaha04/Genshin-impact-data/main/Elements/Element/${name}.png`;
  console.log(element);
  element = new ElementModel(element);
  const data = await ElementModel.findOne({ name: element.name });
  if (!data) {
   await element.save();
  }
 }
 console.log('Finsihed processing');
 process.exit(-1);
};
// elements();
const url = 'https://genshin.gg/elements/';
const scrapeElementalReaction = async () => {
 try {
  await connectDB();
  await getElementId();
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const elemantalReactionType = $('.rt-tbody');
  const introduction = $('.table-introduction');
  const header = $('h2');
  for (let i = 0; i < elemantalReactionType.length; i++) {
   let elemantalReactions = {
    name: header[i].children[0].data,
    description: introduction[i].children[0].data,
   };
   const reactions = await elementalReaction(elemantalReactionType[i].children);
   elemantalReactions.reactions = reactions;

   elemantalReactions = new ElementReactionModel(elemantalReactions);
   const data = await ElementReactionModel.findOne({
    name: elemantalReactions.name,
   });
   if (!data) {
    await elemantalReactions.save();
   }
  }
 } catch (error) {
  console.log(error);
 }
 process.exit(-1);
};

const elementalReaction = async (reactions) => {
 const reactionList = [];
 for (let i = 0; i < reactions.length; i++) {
  const reactionArrtibutes = reactions[i].children[0];
  let reaction = { element1: [], element2: [] };
  for (let j = 0; j < reactionArrtibutes.children.length; j++) {
   let attribute = reactionArrtibutes.children[j];
   if (j === 0) {
    reaction.name = attribute.children[0].data;
   } else if (j === 1) {
    let isFirst = true;
    const elementList = attribute.children[0];
    for (let k = 0; k < elementList.children.length; k++) {
     if (
      elementList.children[k].attribs &&
      elementList.children[k].attribs.alt
     ) {
      const elementName = elementList.children[k].attribs.alt;
      const elementId = elementalId[elementName];
      if (isFirst) reaction.element1.push(elementId);
      else reaction.element2.push(elementId);
     } else {
      isFirst = false;
     }
    }
    if (reaction.element1.length === 0 && reaction.element2.length === 0) {
     reaction.description = elementList.children[0].data;
    }
   } else {
    reaction.effect = '';
    const table = attribute.children[0];
    for (let i = 0; i < table.children.length; i++) {
     let ele = table.children[i];
     while (ele.children && ele.children.length > 0) {
      ele = ele.children[0];
     }
     reaction.effect += ele.data;
    }
   }
  }
  reactionList.push(reaction);
 }
 return reactionList;
};

// setTimeout(elements, 10000);
scrapeElementalReaction();
