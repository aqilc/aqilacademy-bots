let f = require("./f.js");

let trivia = {
  tokens: [],
  responses: ["Success", "No results", "Invalid parameter", "Token not found", "Token empty"],
};

async function update(dT) {
  if(dT)
    setTimeout(() => update(true), 3.6e+6);
  
  try {
    trivia.categories = await f.getCategories();
    trivia.globalCounts = await f.parseURL("https://opentdb.com/api_count_global.php");
  } catch(err) {
    throw err;
  }
};
async function getQuestion(amount, cat, 
module.exports = function() {
  
  return trivia;
};