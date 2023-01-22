const router = require("express").Router();
const homeRouter = require("express").Router({ mergeParams: true });
const electionRouter = require("express").Router({ mergeParams: true });
const voteRouter = require("./voteRouter");
const questionRouter = require("express").Router({ mergeParams: true });
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const { hashPassword, validatePassword } = require("../lib/passwordUtils");
const { Admin, Election, Question, Option, Voters } = require("../models");
const { isAdmin } = require("./authMiddleware");
const { validateElection } = require("./validateElection");
const { electionStatus } = require("./electionStatus");
const { noModification } = require("./noModification");

// homeRouter is used for ease of writing APIs
router.use("/home", connectEnsureLogin.ensureLoggedIn(), isAdmin, homeRouter);
router.use(
  "/home/election/:id",
  connectEnsureLogin.ensureLoggedIn(),
  noModification,
  electionRouter
);
router.use(
  "/home/election/:id/question",
  connectEnsureLogin.ensureLoggedIn(),
  questionRouter
);
// voteRouter is used for ballot preview and voters to vote on election
router.use("/vote", voteRouter);

// Helping Database Sync link: Should be removed during production
router.get("/sync", async (request, response) => {
  await Admin.sync({ alter: true });
  await Election.sync({ alter: true });
  await Question.sync({ alter: true });
  await Option.sync({ alter: true });
  await Voters.sync({ alter: true });
  request.flash("error", "Database Synced");
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

// Helping link to delete all elections and associated data
router.get("/reset", async (request, response) => {
  try {
    await Election.destroy({
      where: {},
      truncate: false,
    });
    await Voters.destroy({
      where: {},
      truncate: false,
    });
    request.flash("error", "All Elections cleared");
    response.redirect("/");
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/");
  }
});

// Sign Out or Log out route
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

// API for getting user details in JSON
homeRouter.get("/user", async (request, response) => {
  response.status(200).json(request.user);
});

// Page for managing user detail
homeRouter.get("/user/settings", async (request, response) => {
  response.render("userSettings", {
    csrfToken: request.csrfToken(),
    title: "User Settings",
    user: request.user,
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
electionRouter.get("/", async (request, response) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    if (election === null)
      throw new Error("Not eligible to manage this election");
    const question = await Question.findAllQuestions({
      electionId: election.id,
    });
    const voter = await Voters.findAllVoters({
      electionId: election.id,
    });
    response.render("manageElection", {
      csrfToken: request.csrfToken(),
      title: "Manage Election",
      election,
      question,
      voterLength: voter.length,
    });
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
  }
});

// Page for updating name of election
electionRouter.get("/name", async (request, response) => {
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

homeRouter.get("/election/:id/addvoters", async (request, response) => {
  try {
    const election = await Election.findElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    if (election === null) throw new Error("Not eligible to add voter");
    const voter = await Voters.findAllVoters({
      electionId: election.id,
    });
    response.render("addVoters", {
      title: "Register Voters",
      csrfToken: request.csrfToken(),
      election,
      voter,
    });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
});

homeRouter.get(
  "/election/:id/preview",
  validateElection,
  async (request, response) => {
    try {
      response.render("previewElection", {
        title: "Vote Election",
        csrfToken: request.csrfToken(),
        election: request.election,
        question: request.question,
        options: request.options,
      });
    } catch (error) {
      request.flash("error", error.message);
      response.redirect("/home");
    }
  }
);

electionRouter.get(
  "/launch-election",
  validateElection,
  async (request, response) => {
    try {
      response.render("previewElection", {
        title: "Vote Election",
        csrfToken: request.csrfToken(),
        election: request.election,
        question: request.question,
        options: request.options,
      });
    } catch (error) {
      request.flash("error", error.message);
      response.redirect("/home");
    }
  }
);

homeRouter.get(
  "/election/:id/preview-result",
  electionStatus,
  async (request, response) => {
    response.render("electionResult", {
      title: "Results",
      csrfToken: request.csrfToken(),
      election: request.election,
      question: request.question,
      options: request.options,
      voters: request.voters,
      admin: true,
      voter: false,
    });
  }
);

// Page for adding a new question to election
homeRouter.get(
  "/election/:id/question/new",
  noModification,
  async (request, response) => {
    try {
      const election = await Election.findElection({
        electionId: request.params.id,
        adminId: request.user.id,
      });
      return response.render("addQuestion", {
        title: "Add New Question",
        election,
        csrfToken: request.csrfToken(),
      });
    } catch (error) {
      request.flash("error", error.message);
      response.redirect("back");
    }
  }
);

homeRouter.get("/election/:id/question", async (request, response) => {
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
    request.flash("error", error.message);
    return response.redirect("back");
  }
});

homeRouter.get("/election/:id/question/:qid", async (request, response) => {
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
    request.flash("error", error.message);
    return response.redirect(`/home/election/${request.params.id}/question`);
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

// Request for updating user password
homeRouter.post("/user/settings/change-password", async (request, response) => {
  const admin = await Admin.findAdmin(request.user.id);
  if (
    await validatePassword(request.body.currentPassword, admin.passwordHash)
  ) {
    const newPasswordHash = await hashPassword(request.body.newPassword);
    await admin.updatePassword(newPasswordHash);
    request.flash("success", "Password Changed Successfully");
    response.redirect("back");
  } else {
    request.flash("error", "Current Password Incorrect");
    response.redirect("back");
  }
});

// Request for updating user details
homeRouter.post("/user/settings/update-details", async (request, response) => {
  try {
    const admin = await Admin.findAdmin(request.user.id);
    await admin.updateUser({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
    });
    request.flash("success", "Details Updated Successfully");
    response.redirect("back");
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("back");
  }
});

homeRouter.post("/election/new", async (request, response) => {
  console.log("Creating a new election");
  try {
    const election = await Election.addElection({
      name: request.body.name,
      adminId: request.user.id,
    });
    request.flash("error", "New election created");
    return response.redirect(`/home/election/${election.id}`);
  } catch (error) {
    request.flash("error", error.message);
    return response.redirect("back");
  }
});

electionRouter.post("/name", async (request, response) => {
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
      electionId: request.params.id,
      adminId: request.user.id,
    });
    request.flash("error", "Election deleted sucessfully");
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

electionRouter.post("/addvoters", async (request, response) => {
  const passwordHash = await hashPassword(request.body.password);
  try {
    await Voters.addVoter({
      voter_id: request.body.voter_id,
      passwordHash,
      electionId: request.body.electionId,
    });
    request.flash("error", "Voter registered sucessfully");
    return response.redirect(`/home/election/${request.params.id}/addvoters`);
  } catch (error) {
    request.flash("error", error.message);
    return response.redirect(`/home/election/${request.params.id}/addvoters`);
  }
});

// API Route for deleting voters
electionRouter.delete("/addvoters", async (request, response) => {
  try {
    const election = await Election.findElection({
      electionId: request.body.electionId,
      adminId: request.user.id,
    });
    if (election === null) throw new Error("Not eligible to remove voter");
    await Voters.deleteVoter({
      voter_id: request.body.voter_id,
      electionId: request.body.electionId,
    });
    request.flash("error", "Voter deleted successfully");
    return response.json({ success: true });
  } catch (error) {
    request.flash("error", error.message);
    return response.status(422).json(error.message);
  }
});

electionRouter.put("/launch-election", async (request, response) => {
  try {
    await Election.startElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    request.flash("error", "Election launched sucessfully");
    return response.json({ success: true });
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
  }
});

homeRouter.put("/election/:id/end-election", async (request, response) => {
  try {
    await Election.endElection({
      electionId: request.params.id,
      adminId: request.user.id,
    });
    request.flash("error", "Election ended sucessfully");
    return response.json({ success: true });
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/home");
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
    request.flash("error", error.message);
    return response.redirect(303, "back");
  }
});

questionRouter.post("/:qid/option", async (request, response) => {
  try {
    await Option.createOption({
      name: request.body.name,
      questionId: request.body.questionId,
    });
    request.flash("error", "Option added successfully");
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

// API Route for deleting option
questionRouter.delete("/:qid/option", async (request, response) => {
  try {
    await Option.deleteOption({
      questionId: request.params.qid,
      optionId: request.body.oid,
    });
    request.flash("error", "Option deleted successfully");
    return response.json({ success: true });
  } catch (error) {
    request.flash("error", error.message);
    return response.status(422).json(error.message);
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
  passport.authenticate("local-admin", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect("/home");
  }
);

module.exports = router;
