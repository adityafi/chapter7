require("dotenv").config();

const express = require("express");

const gameRouter = require("./domains/games/routes");

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use(gameRouter);

app.listen(PORT, function () {
  console.log(`server listening on PORT: ${PORT}`);
});
