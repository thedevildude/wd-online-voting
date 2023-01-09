const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const { isVoter } = require("./authMiddleware");
const { validateElectionStatus } = require("./validateElectionStatus");

voteRouter.get(
  "/election/:id",
  isVoter,
  validateElectionStatus,
  (request, response) => {
    try {
      response.render("voteElection", {
        title: "Vote Election",
        csrfToken: request.csrfToken(),
        election: request.election,
        question: request.question,
        options: request.options,
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

module.exports = voteRouter;
