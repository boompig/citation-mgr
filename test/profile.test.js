const express = require("express");
const authRouter = require("../node-controllers/auth-router");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { User } = require("../node-controllers/db-common");
const profileRouter = require("../node-controllers/profile");

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
app.use("/api/profile", profileRouter);

describe("test profile router", () => {
    const EMAIL = "testerson@test.com";
    const PASSWORD = "hello world 123";
    const NAME = "Test Testerson";
    const NEW_EMAIL = "new@test.com";

    let testSession = null;

    const cleanup = async() => {
        let user = await User.where({email: EMAIL}).fetch();
        if(user) {
            await user.destroy();
        }
        user = await User.where({email: NEW_EMAIL}).fetch();
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

    test("GET /api/profile 401", async () => {
        // not authenticated
        await testSession
            .get("/api/profile")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("GET /api/profile 200", async () => {
        // create account
        await testSession
            .post("/auth/register")
            .send({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // login
        await testSession
            .post("/auth/login")
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // get profile
        const res = await testSession
            .get("/api/profile")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body.name).toStrictEqual(NAME);
        expect(res.body.email).toStrictEqual(EMAIL);
        expect(res.body.is_admin).toStrictEqual(false);
        expect(res.body).not.toHaveProperty("password");
    });

    test("POST /api/profile 401 - bad password", async () => {
        // register
        await testSession
            .post("/auth/register")
            .send({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // login
        await testSession
            .post("/auth/login")
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // change profile
        await testSession
            .post("/api/profile")
            .send({
                email: NEW_EMAIL,
                name: "New Newerson",
                password: "bad password"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        // get profile
        const res = await testSession
            .get("/api/profile")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.name).toStrictEqual(NAME);
        expect(res.body.email).toStrictEqual(EMAIL);
        expect(res.body.is_admin).toStrictEqual(false);
    });

    test("POST /api/profile 200", async () => {
        // register
        await testSession
            .post("/auth/register")
            .send({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // login
        await testSession
            .post("/auth/login")
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // change profile
        await testSession
            .post("/api/profile")
            .send({
                email: NEW_EMAIL,
                name: "New Newerson",
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // get profile
        const res = await testSession
            .get("/api/profile")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.name).toStrictEqual("New Newerson");
        expect(res.body.email).toStrictEqual(NEW_EMAIL);
        expect(res.body.is_admin).toStrictEqual(false);
    });
});