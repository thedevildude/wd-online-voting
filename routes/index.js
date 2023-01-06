const router = require("express").Router();
const homeRouter = require("express").Router({ mergeParams: true });
const questionRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const { hashPassword } = require("../lib/passwordUtils");
const { Admin, Election, Question, Option } = require("../models");

// homeRouter is used for ease of writing APIs
router.use("/home", connectEnsureLogin.ensureLoggedIn(), homeRouter);
router.use(
  "/home/election/:id/question",
  connectEnsureLogin.ensureLoggedIn(),
  questionRouter
);

// Helping Database Sync link: Should be removed during production
router.get("/sync", async (request, response) => {
  await Admin.sync({ alter: true });
  await Election.sync({ alter: true });
  await Question.sync({ alter: true });
  await Option.sync({ alter: true });
  response.redirect("/");
});
router.get("/", async (request, response) => {
  response.render("index");
});

// Sign up Page
router.get("/signup", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
    title: "Sign Up",
  });
});

// Sign In or Login Page
router.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
    title: "Login",
  });
});

// Sign Out ot Log out route
router.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    request.flash("error", "Logged Out Successfully");
    response.redirect("/");
  });
});

// Homepage for signed in user
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

// Page for adding new Election
homeRouter.get("/election/new", (request, response) => {
  response.render("addElection", {
    csrfToken: request.csrfToken(),
    title: "Create a new election",
  });
});

// Page for managing elections
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

// Page for updating name of election
homeRouter.get("/election/:id/name", async (request, response) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    response.render("changeName", {
      csrfToken: request.csrfToken(),
      title: "Change Election",
      data: election,
      typeData: "name",
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
});

// Page for adding a new question to election
questionRouter.get("/new", async (request, response) => {
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

questionRouter.get("/", async (request, response) => {
  try {
    const question = await Question.findAllQuestions({
      electionId: request.params.id,
    });
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    return response.render("manageQuestions", {
      csrfToken: request.csrfToken(),
      title: "Manage Questions",
      question,
      name: election.name,
    });
  } catch (error) {
    return response.json({ error: error.message });
  }
});

questionRouter.get("/:qid", async (request, response) => {
  try {
    const question = await Question.findQuestion({
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    const option = await Option.findAllOptions({
      questionId: request.params.qid,
    });
    response.render("updateQuestion", {
      csrfToken: request.csrfToken(),
      title: "Update Question",
      question,
      option,
      id: election.id,
    });
  } catch (error) {
    return response.json({ error: error.message });
  }
});

questionRouter.get("/:qid/name", async (request, response) => {
  try {
    const question = await Question.findQuestion({
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    response.render("changeName", {
      csrfToken: request.csrfToken(),
      title: "Change Question",
      data: question,
      typeData: "name",
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
});

questionRouter.get("/:qid/description", async (request, response) => {
  try {
    const question = await Question.findQuestion({
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    response.render("changeName", {
      csrfToken: request.csrfToken(),
      title: "Change Description",
      data: question,
      typeData: "description",
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
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

questionRouter.post("/new", async (request, response) => {
  try {
    const question = await Question.createQuestion({
      name: request.body.name,
      description: request.body.description,
      electionId: request.params.id,
    });
    console.log("Question created with id:", question.id);
    return response.redirect(`/home/election/${request.params.id}/question`);
  } catch (error) {
    return response.status(422).json(error.message);
  }
});

questionRouter.post("/:qid/name", async (request, response) => {
  try {
    await Question.updateName({
      name: request.body.name,
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    request.flash("error", "Question changed sucessfully");
    return response.redirect(
      `/home/election/${request.params.id}/question/${request.params.qid}`
    );
  } catch (error) {
    return response.status(422).json(error.message);
  }
});

questionRouter.post("/:qid/description", async (request, response) => {
  try {
    await Question.updateDescription({
      description: request.body.name,
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    request.flash("error", "Description updated sucessfully");
    return response.redirect(
      `/home/election/${request.params.id}/question/${request.params.qid}`
    );
  } catch (error) {
    return response.status(422).json(error.message);
  }
});

questionRouter.delete("/:qid/delete", async (request, response) => {
  console.log("Deleting a question by id: ", request.params.qid);
  try {
    await Question.deleteQuestion({
      electionId: request.params.id,
      questionId: request.params.qid,
    });
    request.flash("error", "Question deleted sucessfully");
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error.message);
  }
});

questionRouter.post("/:qid/option", async (request, response) => {
  try {
    await Option.createOption({
      name: request.body.name,
      questionId: request.body.questionId,
    });
    request.flash("error", "Option added sucessfully");
    return response.redirect(
      `/home/election/${request.params.id}/question/${request.params.qid}`
    );
  } catch (error) {
    request.flash("error", error.message);
    return response.redirect(
      `/home/election/${request.params.id}/question/${request.params.qid}`
    );
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

module.exports = router;
