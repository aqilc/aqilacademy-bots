let f = require("./f.js");

let trivia = {
  tokens: [],
  responses: ["Success", "No results", "Invalid parameter", "Token not found", "Token empty"],
  questions: [],
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
async function getQuestion(amount, cat, diff, type) {
  let url = "https://opentdb.com?amount=1";
  
  if(cat)
    url += "&category=" + cat;
  if(diff)
    url += "&difficulty=" + ["easy", "medium", "hard"][diff];
  if(type)
    url += "&type=" + ["multiple", "boolean"][type];
  
  let json = await f.parseURL(url);
  console.log(json.results);
  return json.results;
}
module.exports = function() {
  
  return trivia;
};