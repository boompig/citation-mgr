const express = require("express");
const quotesRouter = require("../node-controllers/quotes");
const publicationsRouter = require("../node-controllers/publications");
const projectsRouter = require("../node-controllers/projects");
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
app.use("/api/projects", projectsRouter);
app.use("/api/publications", publicationsRouter);
app.use("/api/quotes", quotesRouter);

// app now ready for testing
describe("test quotes router", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    const NAME = "Test Testington";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            // should destroy all associated data
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

    const getQuotes = async (projectID) => {
        let url = "/api/quotes";
        if(projectID) {
            url += `?project=${projectID}`;
        }
        return testSession.get(url)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createPublication = async (pub) => {
        return testSession.post("/api/publications")
            .send({name: pub.name})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createProject = async(project) => {
        return testSession.post("/api/projects")
            .send(project)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const createQuote = async(quote) => {
        return testSession.post("/api/quotes")
            .send(quote)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    test("get quotes without authentication", async() => {
        await testSession.get("/api/quotes")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("get quotes with authentication", async () => {
        await login();
        const res = await getQuotes();
        console.log(res.text);
        // array
        expect(res.body).toStrictEqual([]);
    });

    test("create new quote", async () => {
        const pub = {
            name: "Learning internal representations by error-propagation",
            first_author: "Hinton, G.",
            author_group: "University of Toronto",
            year: 1986,
        };

        const project = {
            name: "machine learning paper"
        };

        await login();
        const pubRes = await createPublication(pub);
        const pubId = pubRes.body.insert_id;

        const projRes = await createProject(project);
        const projId = projRes.body.insert_id;

        // quote a long quote
        const quote = {
            quote: "he constraint that similar input patterns lead to similar outputs can lead to an inability ofthe system to learn certain mappings from input to output.",
            project: projId,
            publication: pubId
        };

        const res = await createQuote(quote);
        console.log(res.text);
        expect(typeof res.body.insert_id).toStrictEqual("number");
    });

    test("get quotes for project", async () => {
        const pub = {
            name: "Learning internal representations by error-propagation",
            first_author: "Hinton, G.",
            author_group: "University of Toronto",
            year: 1986,
        };

        const project = {
            name: "machine learning paper"
        };

        await login();
        const pubRes = await createPublication(pub);
        const pubId = pubRes.body.insert_id;

        const projRes = await createProject(project);
        const projectID = projRes.body.insert_id;

        // quote a long quote
        const quote = {
            quote: "he constraint that similar input patterns lead to similar outputs can lead to an inability ofthe system to learn certain mappings from input to output.",
            project: projectID,
            publication: pubId
        };

        const res = await createQuote(quote);
        console.log(res.text);
        expect(typeof res.body.insert_id).toStrictEqual("number");

        const quotesRes = await getQuotes(projectID);
        console.log(quotesRes.text);
        const quotesOut = quotesRes.body;
        expect(quotesOut.length).toBe(1);
        expect(quotesOut[0].quote).toBe(quote.quote);
    });
});