const express = require("express");
const authRouter = require("../node-controllers/auth-router");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { User } = require("../node-controllers/db-common");

const app = express();

// body-parser middleware first
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// then session middleware
app.use(expressSession({
    secure: false,
    secret: "random string",
    saveUninitialized: false,
    resave: false,
}));

// then mount routers
app.use("/auth", authRouter);

// app now ready for testing
describe("/auth", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    let testSession = null;

    const cleanup = async() => {
        const user = await User.where({email: EMAIL}).fetch();
        if(user) {
            await user.destroy();
        }
    };

    beforeAll(async() => {
        await cleanup();
    });

    beforeEach(async() => {
        testSession = session(app);
    });

    afterEach(async() => {
        await cleanup();
    });

    test("POST /auth/register 400", async() => {
        const res = await testSession.post("/auth/register")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);
        expect(res.body.status).toStrictEqual("error");
    });

    test("POST /auth/register 200", async() => {
        const res = await testSession.post("/auth/register")
            .set("Accept", "application/json")
            .send({email: EMAIL, password: PASSWORD, name: "Test Testington"})
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.status).toStrictEqual("success");
    });

    test("POST /auth/login 200", async() => {
        await testSession.post("/auth/register")
            .set("Accept", "application/json")
            .send({email: EMAIL, password: PASSWORD, name: "Test Testington"})
            .expect("Content-Type", /json/)
            .expect(200);
        const res = await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({email: EMAIL, password: PASSWORD})
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.status).toStrictEqual("success");
    });
});