const { Admin, Voters, Election } = require("../models");

const isAdmin = (request, response, next) => {
  if (request.isAuthenticated()) {
    if (request.user instanceof Admin) {
      next();
    } else {
      request.flash("error", "You are not authorized");
      response.redirect("/login");
    }
  }
};

const isVoter = async (request, response, next) => {
  try {
    const election = await Election.findByPk(request.params.id);
    if (election.electionStatus == true && election.electionEnded == true) {
      next();
    } else {
      if (request.isAuthenticated() && request.user instanceof Voters) {
        const voter = await Voters.findVoter(request.user.id);
        if (voter.eligible_electionId != request.params.id) {
          request.flash("error", "You are not eligible for this election");
          response.render("voterLogin", {
            csrfToken: request.csrfToken(),
            title: "Voter Login",
            electionId: request.params.id,
          });
        } else next();
      } else {
        response.render("voterLogin", {
          csrfToken: request.csrfToken(),
          title: "Voter Login",
          electionId: request.params.id,
        });
      }
    }
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("back");
  }
};

module.exports.isAdmin = isAdmin;
module.exports.isVoter = isVoter;
