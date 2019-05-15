const express = require("express");
const refsRouter = require("../node-controllers/refs");
const authRouter = require("../node-controllers/auth-router");
const auth = require("../node-controllers/auth-backend");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { Reference } = require("../node-controllers/db-common");

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
app.use("/refs", refsRouter);
app.use("/auth", authRouter);

// app now ready for testing
describe("/bow", () => {
    const EMAIL = "testington@test.com";
    const PASSWORD = "hello world";
    let testSession = null;

    const cleanup = async() => {
        const user = await auth.getUserByEmail(EMAIL);
        if(user) {
            const refs = await Reference.where({user: user.get("id")}).fetchAll();
            if(refs.length > 0) {
                // console.log(`[afterAll] Found ${refs.length} references, deleeting...`);
                const promises = refs.map((ref) => {
                    return ref.destroy();
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

    test("GET /refs 401", async() => {
        await testSession.get("/refs")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("GET /refs 200", async () => {
        const res = await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        console.log(res.text);
        const bowRes = await testSession.get("/refs")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        console.log(bowRes.text);
        expect(bowRes.body).toStrictEqual([]);
    });

    test("POST /refs 200 - new BoW", async () => {
        const ref = {
            name: "reference 1",
            first_author: "Hinton, G.",
            author_group: "University of Toronto",
            year: 2011,
            body_of_work: "",
            citation_num: 1
        };
        await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        const res = await testSession.post("/refs")
            .send(ref)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        console.log(res.text);
        expect(typeof res.body.insert_id).toStrictEqual("number");
    });

    test("POST /refs 200 - existing BoW", async () => {
        const refs = [
            {
                name: "This paper presents a generalization of the perception learning procedure for learning the correct sets of connections for arbitrary networks.",
                first_author: "Hinton, G.",
                author_group: "University of Toronto",
                year: 1986,
                body_of_work: "Learning internal representations by error-propagation",
                citation_num: 1
            },
            {
                name: "The major empirical contribution of the work is to show that the problem of local minima not serious in this application of gradient descent. Keywords: Learning; networks; Perceptrons; Adaptive systems; Learning machines; and Back propagation.",
                first_author: "Hinton, G.",
                author_group: "University of Toronto",
                year: 1986,
                body_of_work: "Learning internal representations by error-propagation",
                citation_num: 2
            },
        ];
        await testSession.post("/auth/login")
            .set("Accept", "application/json")
            .send({
                email: EMAIL,
                password: PASSWORD
            })
            .expect(200);
        // let responses = [];
        for(const ref of refs) {
            const res = await testSession.post("/refs")
                .send(ref)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);
            console.log(res.text);
            // responses.push(res.body);
            expect(typeof res.body.insert_id).toStrictEqual("number");
            expect(typeof res.body.bow_id).toStrictEqual("number");
        }
        // expect there are 2 references now
        const refResponse = await testSession.get("/refs")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        const outputRefs = refResponse.body;
        expect(outputRefs.length).toBe(2);
        // make sure that the body of work on each is the same
        expect(outputRefs[0].bow_id).toBe(outputRefs[1].bow_id);
    });
});