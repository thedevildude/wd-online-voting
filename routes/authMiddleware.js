const { Admin, Voters } = require("../models");

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

const isVoter = (request, response, next) => {
  if (request.isAuthenticated() && request.user instanceof Voters) {
    next();
  } else {
    response.render("voterLogin", {
      csrfToken: request.csrfToken(),
      title: "Voter Login",
      electionId: request.params.id,
    });
  }
};

module.exports.isAdmin = isAdmin;
module.exports.isVoter = isVoter;
