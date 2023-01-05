const router = require("express").Router();
const homeRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const { hashPassword } = require("../lib/passwordUtils");
const { Admin, Election, Question } = require("../models");

router.use("/home", connectEnsureLogin.ensureLoggedIn(), homeRouter);

// Helping Sync link
router.get("/sync", async (request, response) => {
  await Admin.sync({ alter: true });
  await Election.sync({ alter: true });
  await Question.sync({ alter: true });
  response.redirect("/");
});
router.get("/", async (request, response) => {
  response.render("index");
});

router.get("/signup", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
    title: "Sign Up",
  });
});

router.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
    title: "Login",
  });
});

router.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    request.flash("error", "Logged Out Successfully");
    response.redirect("/");
  });
});

homeRouter.get("/", async (request, response) => {
  const election = await Election.findAllElections({
    adminId: request.user.id,
  });
  response.render("home", {
    title: "Home",
    election: election,
    user: request.user.firstName,
    csrfToken: request.csrfToken(),
  });
});

homeRouter.get("/election/new", (request, response) => {
  response.render("addElection", {
    csrfToken: request.csrfToken(),
    title: "Create a new election",
  });
});

homeRouter.get("/election/:id", async (request, response) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    const question = await Question.findAllQuestions({
      electionId: election.id,
    });
    response.render("manageElection", {
      csrfToken: request.csrfToken(),
      title: "Manage Election",
      election,
      question,
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
});

homeRouter.get("/election/:id/name", async (request, response) => {
  const election = await Election.findElection({
    electionId: request.params.id,
    adminId: request.user.id,
  });
  try {
    response.render("updateElection", {
      csrfToken: request.csrfToken(),
      title: "Update Election",
      election,
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
});

homeRouter.get("/election/:id/question/new", async (request, response) => {
  const election = await Election.findElection({
    electionId: request.params.id,
    adminId: request.user.id,
  });
  return response.render("addQuestion", {
    title: "Add New Question",
    election,
    csrfToken: request.csrfToken(),
  });
});

homeRouter.get("/election/:id/question", async (request, response) => {
  const question = await Question.findAllQuestions({
    electionId: request.params.id,
  });
  return response.render("manageQuestions", {
    csrfToken: request.csrfToken(),
    title: "Manage Questions",
    question,
    id: request.params.id,
  });
});

homeRouter.post("/election/new", async (request, response) => {
  console.log("Creating a new election");
  try {
    const election = await Election.addElection({
      name: request.body.name,
      adminId: request.user.id,
    });
    return response.redirect(`/home/election/${election.id}`);
  } catch (error) {
    console.log(error);
  }
});

homeRouter.post("/election/:id/name", async (request, response) => {
  try {
    await Election.updateName({
      name: request.body.name,
      electionId: request.params.id,
      adminId: request.user.id,
    });
    request.flash("error", "Election name updated sucessfully");
    return response.redirect(`/home/election/${request.params.id}`);
  } catch (error) {
    return response.status(422).json(error.message);
  }
});

homeRouter.post("/election/:id/question/new", async (request, response) => {
  console.log("Creating a new question");
  const question = await Question.createQuestion({
    name: request.body.name,
    description: request.body.description,
    electionId: request.body.electionId,
  });
  console.log("Question created with id:", question.id);
  return response.redirect(`/home/election/${request.params.id}/question`);
});

homeRouter.delete("/election/:id/delete", async (request, response) => {
  try {
    console.log("Deleting a election by id: ", request.params.id);
    await Election.deleteElection({
      electionId: parseInt(request.params.id),
      adminId: request.user.id,
    });
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

router.post("/admin", async (request, response) => {
  try {
    if (request.body.password.length < 1) {
      throw new Error("Password cannot be empty");
    }
    const passwordHash = await hashPassword(request.body.password);
    const admin = await Admin.addAdmin({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      passwordHash,
    });
    request.login(admin, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/home");
    });
  } catch (error) {
    request.flash("error", error.message);
    if (error.message == "Email is already registered") {
      return response.redirect("/login");
    } else return response.redirect("/signup");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect("/home");
  }
);

(module.exports = router), homeRouter;
