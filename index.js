const express = require("express");
var cors = require("cors");

require("dotenv").config();

let midrunNodePath;

if (process.env.DEBUG_NODE_SDK_ON_LOCALHOST != "false" && process.env.DEV) {
  console.log("🛠️🛠️🛠️  Midrun-node - local 🛠️ ");
  midrunNodePath = "../../midrun-node/src/index.js"; //); //static lib for the node SDK.
  // midrunNodePath = "../../midrun-node"; //); //static lib for the node SDK.
} else {
  console.log("🛠️🛠️🛠️  Midrun-node - from npm 🛠️ ");
  midrunNodePath = "midrun-node"; //builded version, often out of date...
}

const midrun = require(midrunNodePath);

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const routes = require("./routes");

//var opt = { debug: true, serverCache: true, debugCache: true };
//app.use("/", midrun.router([routes], opt));

var opt = {};
app.use("/", midrun.router(routes, opt));

app.listen(port, () => {
  console.log(`⚡ Example Midrun API listening on port ${port}`);
});
