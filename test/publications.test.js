const express = require("express");
const pubRouter = require("../node-controllers/publications");
const authRouter = require("../node-controllers/auth-router");
const auth = require("../node-controllers/auth-backend");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");

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
app.use("/api/publications", pubRouter);

// app now ready for testing
describe("test publications router", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    const NAME = "Test Testerson";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        // should also destroy publications
        if(user) {
            await user.destroy();
        }
    };

    beforeAll(async() => {
        await cleanup();
    });

    beforeEach(async () => {
        const user = await auth.createUser(EMAIL, PASSWORD, NAME);
        if(!user) {
            console.error("[beforeEach] Failed to create user");
            return false;
        }
        testSession = session(app);
    });

    afterEach(async () => {
        await cleanup();
    });

    const login = async () => {
        return testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
    };

    const getPublications = async () => {
        return testSession.get("/api/publications")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createPublication = async (name) => {
        return testSession.post("/api/publications")
            .send({name: name})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    test("get publications without authenticating", async () => {
        await testSession.get("/api/publications")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("get publications after authenticating", async () => {
        await login();
        const res = await getPublications();
        // console.log(res.text);
        // array
        expect(res.body).toStrictEqual([]);
    });

    test("create new publication", async () => {
        const pub = {
            name: "some paper or other",
        };
        await login();
        const createRes = await createPublication(pub.name);
        // console.log(createRes.text);
        // array
        expect(typeof createRes.body.insert_id).toStrictEqual("number");

        const pubRes = await getPublications();
        // console.log(pubRes.text);
        const resultPubs = pubRes.body;
        expect(resultPubs.length).toBe(1);
        expect(resultPubs[0].name).toStrictEqual(pub.name);
    });
});
