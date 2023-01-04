const app = require("./app");
const passport = require("passport");

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

/* ----Server---- */
app.listen(3030, () => {
  console.log("Server is listening on port 3030");
});
