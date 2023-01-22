const { Election } = require("../models");

const noModification = async (request, response, next) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    if (
      request.originalUrl == `/home/election/${request.params.id}` ||
      election.electionStatus == false
    ) {
      next();
    } else {
      if (election.electionStatus == true) {
        if (
          request.method == "DELETE" ||
          request.method == "POST" ||
          request.method == "PUT"
        ) {
          request.flash("error", "Election cannot be edited after launch");
          response.redirect(303, `back`);
        } else {
          request.flash(405, "error", "Election cannot be edited after launch");
          response.redirect(`back`);
        }
      }
    }
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
  }
};

module.exports.noModification = noModification;
