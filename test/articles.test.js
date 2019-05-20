const express = require("express");
const articlesRouter = require("../node-controllers/articles");
const authRouter = require("../node-controllers/auth-router");
const auth = require("../node-controllers/auth-backend");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const projectRouter = require("../node-controllers/projects");
const quoteRouter = require("../node-controllers/quotes");

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
app.use("/api/articles", articlesRouter);
app.use("/api/projects", projectRouter);
app.use("/api/quotes", quoteRouter);
app.use("/auth", authRouter);

// app now ready for testing
describe("test articles", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    const NAME = "Test Testington";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            // should destroy everything

            await user.destroy();
        }
    };

    beforeAll(async() => {
        await cleanup();
    });

    /**
     * Clean up bodies of work and users created by the test suite
     */
    afterAll(async() => {
        await cleanup();
    });

    beforeEach(async () => {
        testSession = session(app);
    });

    afterEach(async () => {
        await cleanup();
    });

    const createTestAccount = async() => {
        return testSession
            .post("/auth/register")
            .send({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const loginTestAccount = async() => {
        return testSession
            .post("/auth/login")
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createProject = async(project) => {
        return testSession
            .post("/api/projects")
            .send(project)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createQuote = async(quote) => {
        return testSession
            .post("/api/quotes")
            .send(quote)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const getArticles = async() => {
        return testSession.get("/api/articles")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    test("get articles with no auth", async () => {
        await testSession.get("/api/articles")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("get articles with auth - no articles", async () => {
        await createTestAccount();
        await loginTestAccount();

        const res = await getArticles();
        expect(res.body).toStrictEqual([]);
    });

    test("create project", async () => {
        await createTestAccount();
        await loginTestAccount();
        const projectRes = await createProject({
            name: "testProject"
        });
        const projectID = projectRes.body.insert_id;
        expect(typeof projectID).toStrictEqual("number");
    });

    test("create project and quote", async () => {
        await createTestAccount();
        await loginTestAccount();
        const projectRes = await createProject({
            name: "testProject"
        });
        const projectID = projectRes.body.insert_id;
        expect(typeof projectID).toStrictEqual("number");

        const quoteRes = await createQuote({
            quote: "to be or not to be that is the question",
            project: projectID,
            source_title: "Macbeth",
        });
        const quoteID = quoteRes.body.insert_id;
        expect(typeof quoteID).toStrictEqual("number");
    });

    test("get articles with auth - some articles", async () => {
        await createTestAccount();
        await loginTestAccount();
        const projectRes = await createProject({
            name: "testProject"
        });
        const projectID = projectRes.body.insert_id;
        expect(typeof projectID).toStrictEqual("number");

        const quoteRes = await createQuote({
            quote: "to be or not to be that is the question",
            project: projectID,
            source_title: "Macbeth",
        });
        const quoteID = quoteRes.body.insert_id;
        expect(typeof quoteID).toStrictEqual("number");

        const res = await getArticles();
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toStrictEqual("Macbeth");
    });
});