const router = require("express").Router();
const homeRouter = require("express").Router({ mergeParams: true });
// eslint-disable-next-line no-unused-vars
const { Admin, Election } = require("../models");

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

homeRouter.get("/new", (request, response) => {
  response.render("addElection", {
    csrfToken: request.csrfToken(),
    title: "Create a new election",
  });
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

router.post("/addElection", async (request, response) => {
  console.log("Creating a new election");
  try {
    const election = await Election.addElection({
      name: request.body.name,
      adminId: 2,
    });
    return response.json(election);
  } catch (error) {
    console.log(error);
  }
});

(module.exports = router), homeRouter;
