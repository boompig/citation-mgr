const express = require("express");
const bowRouter = require("../node-controllers/bow");
const authRouter = require("../node-controllers/auth-router");
const auth = require("../node-controllers/auth-backend");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { BodyOfWork } = require("../node-controllers/db-common");

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
app.use("/bow", bowRouter);
app.use("/auth", authRouter);

// app now ready for testing
describe("/bow", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            const bows = await BodyOfWork.where({user: user.get("id")}).fetchAll();
            if(bows.length > 0) {
                const promises = bows.map((bow) => {
                    return bow.destroy();
                });
                await Promise.all(promises);
            }

            await user.destroy();
        }
    };

    beforeAll(async() => {
        await cleanup();
        return true;
    });

    /**
     * Clean up bodies of work and users created by the test suite
     */
    afterAll(async() => {
        await cleanup();
        return true;
    });

    beforeEach(async () => {
        await cleanup();

        // create the test user
        // console.log("[beforeEach] Creating test user...");
        const user = await auth.createUser(EMAIL, PASSWORD, "Test Testington");
        if(!user) {
            console.error("Failed to create user");
            return false;
        }
        await user.save();

        testSession = session(app);
        // console.log("[beforeEach] testSession has been set");
        return true;
    });

    afterEach(async () => {
        // console.log("[afterEach] destroying test user...");
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            await user.destroy();
        }
        return true;
    });

    test("GET /bow 401", async () => {
        await testSession.get("/bow")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("GET /bow 200", async () => {
        const res = await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        // console.log("Successfully logged in");
        console.log(res.text);

        const bowRes = await testSession.get("/bow")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        console.log(bowRes.text);

        // array
        expect(bowRes.body).toStrictEqual([]);
    });

    test("POST /bow 200", async () => {
        await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        const res = await testSession.post("/bow")
            .send({name: "some paper or other"})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        console.log(res.text);

        expect(typeof res.body.insert_id).toStrictEqual("number");
    });
});