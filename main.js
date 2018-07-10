
const http = require('http');
const app = require('express')();

//Keeps app running
app.listen(process.env.PORT);
app.get("/", (request, response) => {
  response.sendStatus(200);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

require("./clyde/clyde.js")();
require("./music/music.js")();