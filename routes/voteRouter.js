const voteRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
// eslint-disable-next-line no-unused-vars
const { Admin, Election, Question, Option, Voters } = require("../models");

const validateElection = async (request, response, next) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    if (election === null) {
      throw new Error("You are not eligible to view this election");
    } else {
      const question = await Question.findAllQuestions({
        electionId: election.id,
      });
      if (question.length === 0) {
        throw new Error("No questions in the Elections");
      } else {
        const options = [];
        for (let i = 0; i < question.length; i++) {
          const option = await Option.findAllOptions({
            questionId: question[i].id,
          });
          if (option.length >= 2) {
            options.push(option);
          } else throw new Error("Not enough options in question");
        }
        request.election = election;
        request.question = question;
        request.options = options;
        next();
      }
    }
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("back");
  }
};
voteRouter.get(
  "/election/:id/preview",
  validateElection,
  async (request, response) => {
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
  }
);

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
