require('dotenv').config();
const App = require("./app");



const app = new App(
  [

  ],
  8000
);

app.listen();