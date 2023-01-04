const router = require("express").Router();
const homeRouter = require("express").Router({ mergeParams: true });
// eslint-disable-next-line no-unused-vars
const { Admin, Election, Question, Option } = require("../models");

router.use("/home", homeRouter);

router.get("/", (request, response) => {
  response.render("index");
});

homeRouter.get("/", async (request, response) => {
  const election = await Election.findAllElections({ adminId: 2 });
  response.render("home", {
    title: "Home",
    election: election,
  });
});

homeRouter.get("/election/new", (request, response) => {
  response.render("addElection", {
    csrfToken: request.csrfToken(),
    title: "Create a new election",
  });
});

homeRouter.get("/election/:id", async (request, response) => {
  const election = await Election.findElection({
    electionId: request.params.id,
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
});

homeRouter.get("/election/:id/question/new", async (request, response) => {
  const election = await Election.findElection({
    electionId: request.params.id,
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
      adminId: 2,
    });
    return response.redirect(`/home/election/${election.id}`);
  } catch (error) {
    console.log(error);
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

router.post("/admin", async (request, response) => {
  try {
    const admin = await Admin.addAdmin({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      passwordHash: request.body.password,
    });
    return response.json(admin);
  } catch (error) {
    console.log(error);
  }
});

(module.exports = router), homeRouter;
