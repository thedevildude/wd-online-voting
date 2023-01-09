const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const { isVoter } = require("./authMiddleware");
const { validateElectionStatus } = require("./validateElectionStatus");
// eslint-disable-next-line no-unused-vars
const { Option, Question, Voters } = require("../models");

voteRouter.get(
  "/election/:id",
  isVoter,
  validateElectionStatus,
  (request, response) => {
    try {
      if (request.user.vote_casted === true)
        request.flash(
          "error",
          "You have already responded! Please wait for the resut"
        );
      response.render("voteElection", {
        title: "Vote Election",
        csrfToken: request.csrfToken(),
        election: request.election,
        question: request.question,
        options: request.options,
        vote_casted: request.user.vote_casted,
      });
    } catch (error) {
      console.log(error);
      response.redirect("/home");
    }
  }
);

voteRouter.post(
  "/election/:id/voter-login",
  passport.authenticate("voter-login", {
    failureRedirect: "back",
    failureFlash: true,
  }),
  (request, response) => {
    response.redirect(`back`);
  }
);

voteRouter.post("/election/:id/", async (request, response) => {
  if (request.user.vote_casted === true) {
    request.flash(
      "error",
      "You have already responded! Please wait for the resut"
    );
    response.redirect("back");
  }
  const obj = JSON.parse(JSON.stringify(request.body));
  const objKeys = Object.keys(obj);
  const objValues = Object.values(obj);
  for (let i = 0; i < objKeys.length; i++) {
    if (objKeys[i] == "_csrf") continue;
    await Option.incrementVote({
      questionId: parseInt(objKeys[i]),
      optionId: parseInt(objValues[i]),
    });
  }
  await Voters.updateVoteCasted({
    id: request.user.id,
  });
  request.flash("error", "Vote Casted");
  response.redirect("back");
});

module.exports = voteRouter;
