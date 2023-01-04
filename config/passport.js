const passport = require("passport");
const LocalStrategy = require("passport-local");
const { validatePassword } = require("../lib/passwordUtils");
const { Admin } = require("../models");

passport.use(
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
          const result = await validatePassword(password, user.passwordHash);
          if (result) {
            console.log("Correct password");
            return done(null, user);
          } else {
            console.log("Incorrect Password");
            return done(null, false);
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Admin.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
