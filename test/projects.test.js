const express = require("express");
const authRouter = require("../node-controllers/auth-router");
const session = require("supertest-session");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const { User } = require("../node-controllers/db-common");
const projectRouter = require("../node-controllers/projects");

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
app.use("/api/projects", projectRouter);

describe("test project router", () => {
    const EMAIL = "testerson@test.com";
    const PASSWORD = "hello world 123";
    const NAME = "Test Testerson";

    let testSession = null;

    const cleanup = async() => {
        // should also delete associated projects
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

    const createTestAccount = async() => {
        return testSession.post("/auth/register")
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
        return testSession.post("/auth/login")
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    const getProjects = async() => {
        return testSession.get("/api/projects")
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

    const editProject = async(projectID, newProject) => {
        return testSession.post(`/api/projects/${projectID}`)
            .send(newProject)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
    };

    test("get projects no auth", async () => {
        return testSession
            .get("/api/projects")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
    });

    test("get projects", async () => {
        await createTestAccount();
        await loginTestAccount();
        const res = await getProjects();
        expect(res.body).toStrictEqual([]);
    });

    test("create new project", async() => {
        const inputProject = {
            name: "test project"
        };
        await createTestAccount();
        await loginTestAccount();

        const res = await createProject(inputProject);
        expect(typeof res.body.insert_id).toBe("number");

        const getRes = await getProjects();
        expect(getRes.body.length).toBe(1);
        const outProject = getRes.body[0];
        expect(outProject.name).toStrictEqual(inputProject.name);
    });

    test("edit existing project", async () => {
        const inputProject = {
            name: "test project"
        };

        const newProject = {
            name: "edited project"
        };
        await createTestAccount();
        await loginTestAccount();

        const res = await createProject(inputProject);
        const projectID = res.body.insert_id;
        expect(typeof projectID).toBe("number");

        let getRes = await getProjects();
        expect(getRes.body.length).toBe(1);
        let outProject = getRes.body[0];
        expect(outProject.name).toStrictEqual(inputProject.name);

        await editProject(projectID, newProject);

        getRes = await getProjects();
        expect(getRes.body.length).toBe(1);
        outProject = getRes.body[0];
        expect(outProject.name).toStrictEqual(newProject.name);
    });
});