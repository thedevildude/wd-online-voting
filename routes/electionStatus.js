const { Election, Question, Option, Voters } = require("../models");

const electionStatus = async (request, response, next) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    if (election == null) {
      throw new Error("Not authorized");
    }
    const question = await Question.findAllQuestions({
      electionId: election.id,
    });
    const options = [];
    for (let i = 0; i < question.length; i++) {
      const option = await Option.findAllOptions({
        questionId: question[i].id,
      });
      options.push(option);
    }
    const voters = await Voters.findAllVoters({
      electionId: election.id,
    });
    if (election.electionStatus == true) {
      request.election = election;
      request.question = question;
      request.options = options;
      request.voters = voters;
      next();
    }
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
  }
};

module.exports.electionStatus = electionStatus;
