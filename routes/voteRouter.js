const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const { validateElection } = require("./validateElection");

voteRouter.get("/election/:id", validateElection, async (request, response) => {
  try {
    response.render("voteElection", {
      title: "Vote Election",
      csrfToken: request.csrfToken(),
      election: request.election,
      question: request.question,
      options: request.options,
    });
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
  }
});

voteRouter.get("/election/:id/voter-login", async (request, response) => {
  response.render("voterLogin", {
    csrfToken: request.csrfToken(),
    title: "Voter Login",
  });
});

voteRouter.post(
  "/election/:id/voter-login",
  passport.authenticate("voter-login", {
    failureRedirect: "back",
    failureFlash: true,
  }),
  (request, response) => {
    request.flash("error", "Logged in");
    console.log(request);
    response.redirect("back");
  }
);

module.exports = voteRouter;
