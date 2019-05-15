const express = require("express");
const topicRouter = require("../node-controllers/topics");
const authRouter = require("../node-controllers/auth-router");
const auth = require("../node-controllers/auth-backend");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { Topic } = require("../node-controllers/db-common");

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
app.use("/topics", topicRouter);
app.use("/auth", authRouter);

// app now ready for testing
describe("/topics", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            const topics = await Topic.where({user: user.get("id")}).fetchAll();
            if(topics.length > 0) {
                const promises = topics.map((topic) => {
                    return topic.destroy();
                });
                await Promise.all(promises);
            }

            await user.destroy();
        }
    };

    beforeAll(async() => {
        console.log("[beforeAll] running cleanup...");
        await cleanup();
        return true;
    });

    beforeEach(async () => {
        await cleanup();

        const user = await auth.createUser(EMAIL, PASSWORD, "Test Testington");
        if(!user) {
            console.error("[beforeEach] Failed to create user");
            return false;
        }
        await user.save();

        testSession = session(app);
        return true;
    });

    afterEach(async () => {
        await cleanup();
        return true;
    });

    test("get topics without authenticating", async () => {
        await testSession.get("/topics")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("get topics after authenticating", async () => {
        const res = await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        // console.log("Successfully logged in");
        console.log(res.text);
        const topicRes = await testSession.get("/topics")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        console.log(topicRes.text);
        // array
        expect(topicRes.body).toStrictEqual([]);
    });

    test("create new topic", async () => {
        const topic = {
            name: "some paper or other",
            description: "some description"
        };
        await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        const createRes = await testSession.post("/topics")
            .send(topic)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        console.log(createRes.text);
        // array
        expect(typeof createRes.body.insert_id).toStrictEqual("number");

        const topicRes = await testSession.get("/topics")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        console.log(topicRes.text);
        const resultTopics = topicRes.body;
        expect(resultTopics.length).toBe(1);
        expect(resultTopics[0].name).toStrictEqual(topic.name);
        expect(resultTopics[0].description).toStrictEqual(topic.description);
    });
});
