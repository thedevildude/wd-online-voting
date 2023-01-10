const { Election, Question, Option } = require("../models");

const validateElectionStatus = async (request, response, next) => {
  const election = await Election.findByPk(request.params.id);
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
  if (election.electionStatus == true && election.electionEnded == false) {
    request.election = election;
    request.question = question;
    request.options = options;
    request.status = true;
    next();
  } else if (
    election.electionStatus == false &&
    election.electionEnded == false
  ) {
    request.flash("error", "Election has not started yet");
    response.redirect("/");
  } else if (
    election.electionStatus == true &&
    election.electionEnded == true
  ) {
    request.flash("error", "Election has closed");
    request.election = election;
    request.question = question;
    request.options = options;
    request.status = false;
    next();
  }
};

module.exports.validateElectionStatus = validateElectionStatus;
