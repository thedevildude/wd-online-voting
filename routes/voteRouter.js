const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const { isVoter } = require("./authMiddleware");
const { validateElectionStatus } = require("./validateElectionStatus");
// eslint-disable-next-line no-unused-vars
const { Option, Voters, Question } = require("../models");

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
          voter: true,
          voterSignIn: request.voterSignIn,
          voterSignOut: request.voterSignOut,
          vote_casted: request.vote_casted,
          objKeys: request.objKeys,
          objValues: request.objValues,
        });
      } else {
        if (request.user.vote_casted === true)
          request.flash(
            "error",
            "You have responded! Please wait for the result"
          );
        response.locals.messages = request.flash();
        let objKeys = {};
        let objValues = {};
        if (
          request.user.voterResponse != null ||
          request.user.voterResponse != undefined
        ) {
          objKeys = Object.keys(request.user.voterResponse);
          objValues = Object.values(request.user.voterResponse);
        }
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
      request.flash("error", error.messages);
      response.redirect("/login");
    }
  }
);

voteRouter.get("/election/:id/voter-login", async (request, response) => {
  response.render("voterLogin", {
    csrfToken: request.csrfToken(),
    title: "Voter Login",
    electionId: request.params.id,
    electionEndedLink: true,
  });
});

voteRouter.post(
  "/election/:id/voter-login",
  passport.authenticate("voter-login", {
    failureRedirect: "back",
    failureFlash: true,
  }),
  (request, response) => {
    if (
      request.originalUrl == `/vote/election/${request.params.id}/voter-login`
    ) {
      response.redirect(`./`);
    } else {
      response.redirect("back");
    }
  }
);

voteRouter.post("/election/:id/", isVoter, async (request, response) => {
  if (request.user.vote_casted === true) {
    request.flash("error", "You have responded! Please wait for the result");
    response.redirect("back");
  } else {
    const obj = JSON.parse(JSON.stringify(request.body));
    const objKeys = Object.keys(obj);
    const objValues = Object.values(obj);
    const questions = await Question.findAllQuestions({
      electionId: request.params.id,
    });
    if (objKeys.length != questions.length + 1) {
      request.flash("error", "Please select all the options");
      response.redirect("back");
    } else {
      await Voters.addVoterResponse(obj, request.user.id);
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
    }
  }
});

module.exports = voteRouter;
