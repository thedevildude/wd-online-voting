const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
const extractCsrfToken = (res) => {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
};

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/login").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Voting platform test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/admin").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@jd.com",
      password: "12345",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/home");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/home");
    expect(res.statusCode).toBe(302);
  });

  test("Sign in", async () => {
    const agent = request.agent(server);
    let res = await agent.get("/home");
    expect(res.statusCode).toBe(302);
    await login(agent, "john.doe@jd.com", "12345");
    res = await agent.get("/home");
    expect(res.statusCode).toBe(200);
  });

  test("Creates a new election at home/election/new", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe@jd.com", "12345");
    let res = await agent.get("/home/user");
    const userId = res.body.id;
    res = await agent.get("/home/election/new");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/home/election/new").send({
      name: "Prime Election",
      adminId: userId,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
});
