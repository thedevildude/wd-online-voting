const { Election } = require("../models");

const noModification = async (request, response, next) => {
  try {
    if (
      request.originalUrl == "/home" ||
      request.originalUrl == `/home/election/${request.params.id}`
    ) {
      next();
    } else if (request.params.id != undefined) {
      const election = await Election.findElection({
        electionId: request.params.id,
        adminId: request.user.id,
      });
      if (election.electionStatus == true) {
        request.flash("error", "Election cannot be edited after launch");
        response.redirect(`/home/election/${election.id}`);
      } else if (election.electionStatus == false) {
        next();
      }
    }
  } catch (error) {
    response.status(401).json({ error: error.message });
  }
};

module.exports.noModification = noModification;
