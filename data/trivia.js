let f = require("./f.js");

let trivia = {
  tokens: [],
  responses: ["Success", "No results", "Invalid parameter", "Token not found", "Token empty"],
  update: async function(dT) {
    if(dT)
      setTimeout(() => this.update(true), 3.6e+6);

    try {
      trivia.categories = await f.getCategories();
      trivia.globalCounts = await f.parseURL("https://opentdb.com/api_count_global.php");
    } catch(err) {
      throw err;
    }
  },
};

module.exports = function() {
  trivia.update(true);
  return trivia;
};