const router = require("express").Router();
// eslint-disable-next-line no-unused-vars
const { Admin, Election } = require("../models");

router.get("/", (request, response) => {
  response.render("index");
});

router.get("/addElection", (request, response) => {
  response.render("addElection");
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

module.exports = router;
