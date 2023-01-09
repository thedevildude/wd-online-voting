const { Election, Question, Option } = require("../models");

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
        throw new Error("No Questions in the Elections");
      } else {
        const options = [];
        for (let i = 0; i < question.length; i++) {
          const option = await Option.findAllOptions({
            questionId: question[i].id,
          });
          if (option.length >= 2) {
            options.push(option);
          } else
            throw new Error(
              "Please add atleast two options to",
              question[i].name
            );
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

module.exports.validateElection = validateElection;
