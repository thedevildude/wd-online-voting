const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const { isVoter } = require("./authMiddleware");
const { validateElectionStatus } = require("./validateElectionStatus");
// eslint-disable-next-line no-unused-vars
const { Option, Voters } = require("../models");

voteRouter.get("/election/:id/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    request.flash("success", "Logged Out Successfully");
    response.redirect(`back`);
  });
});

voteRouter.get(
  "/election/:id",
  isVoter,
  validateElectionStatus,
  async (request, response) => {
    try {
      if (!request.status) {
        const voters = await Voters.findAllVoters({
          electionId: request.election.id,
        });
        response.render("electionResult", {
          title: "Results",
          csrfToken: request.csrfToken(),
          election: request.election,
          question: request.question,
          options: request.options,
          voters,
          admin: false,
        });
      } else {
        if (request.user.vote_casted === true)
          request.flash(
            "error",
            "You have responded! Please wait for the result"
          );
        response.locals.messages = request.flash();
        const objKeys = Object.keys(request.user.voterResponse);
        const objValues = Object.values(request.user.voterResponse);
        response.render("voteElection", {
          title: "Vote Election",
          csrfToken: request.csrfToken(),
          election: request.election,
          question: request.question,
          options: request.options,
          vote_casted: request.user.vote_casted,
          objKeys,
          objValues,
        });
      }
    } catch (error) {
      console.log(error);
      response.redirect("/vote/election");
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

voteRouter.post("/election/:id/", isVoter, async (request, response) => {
  if (request.user.vote_casted === true) {
    request.flash("error", "You have responded! Please wait for the result");
    response.redirect("back");
  }
  const obj = JSON.parse(JSON.stringify(request.body));
  await Voters.addVoterResponse(obj, request.user.id);
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
