const express = require("express");
const {
  createGame,
  results,
  getAllGameHistory,
  getDailyGame,
  getMyGames,
  getResults,
} = require("../controlers/gameControler");

const { isAuthanticatedUser, authourizRoles } = require("../middleWare/auth");

const router = express.Router();

router.route("/game/create").post(createGame); 
router.route("/game/results/create").post(isAuthanticatedUser, results);

router.route("/game/my-bets/:userId").get(getMyGames); //user
router.route("/game/results/:date").get(getResults); //user

router.route("/game/stack").get(getDailyGame); //admin
router.route("/game/results").get(getAllGameHistory); //admin

module.exports = router;
