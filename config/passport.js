const passport = require("passport");
const LocalStrategy = require("passport-local");
const { validatePassword } = require("../lib/passwordUtils");
const { Admin, Voters } = require("../models");

passport.use(
  "local-admin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Admin.findOne({
        where: {
          email: username,
        },
      })
        .then(async function (user) {
          if (user === null) {
            return done(null, false, { message: "Username is not registered" });
          }
          const result = await validatePassword(password, user.passwordHash);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(null, false, {
            message: error.message,
          });
        });
    }
  )
);

passport.use(
  "voter-login",
  new LocalStrategy(
    {
      usernameField: "voter_id",
      passwordField: "password",
      passReqToCallback: true,
    },
    (request, username, password, done) => {
      Voters.findOne({
        where: {
          voter_id: username,
          eligible_electionId: request.params.id,
        },
      })
        .then(async (user) => {
          if (user === null) {
            return done(null, false, {
              message: "Not authorized to vote on this election",
            });
          }
          const result = await validatePassword(password, user.passwordHash);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(null, false, {
            message: error.message,
          });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  if (user instanceof Admin) {
    console.log("Serializing admin in session: ", user.id);
    done(null, { id: user.id, type: "Admin" });
  } else if (user instanceof Voters) {
    console.log("Serializing voter in session: ", user.voter_id);
    done(null, { id: user.id, type: "Voter" });
  }
});

passport.deserializeUser((obj, done) => {
  if (obj.type === "Admin") {
    Admin.findByPk(obj.id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  } else if (obj.type === "Voter") {
    Voters.findByPk(obj.id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  }
});
