const { Admin, Voters } = require("../models");

module.exports.isAdmin = (request, response, next) => {
  if (request.isAuthenticated()) {
    if (request.user instanceof Admin) {
      next();
    } else {
      request.flash("error", "You are not authorized");
      response.redirect("/login");
    }
  }
};

module.exports.isVoter = (request, response, next) => {
  if (request.isAuthenticated()) {
    if (request.user instanceof Voters) {
      next();
    } else {
      request.flash("error", "You are not authorized");
      response.redirect("back");
    }
  }
};
