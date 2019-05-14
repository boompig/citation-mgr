#!/bin/bash

/*
* NOTE to future self:
* I apologize for this
* this was meant as a quick and dirty way to make sure the server didn't crash when I visited these pages
* hopefully it will be easy for you to refactor into a proper test suite
*/

const USERNAME = "dan";

const request = require("supertest");
// set up a few variables for testing
const process = require("process");
process.env["PORT"] = 8081;
process.env["NODE_ENV"] = "unit-test";

const app = require("../server");

describe("/login", () => {
    test("either creates the account or logs you in", async () => {
        const response = await request(app)
            .post("/login")
            .send({name: USERNAME})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body.status).toBe("success");
    });

});

describe("/topics", () => {
    test("get topics for specific username", async () => {
        const response = await request(app)
            .get("/topics")
            .send({username: USERNAME})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // array
        expect(typeof response.body).toBe("object");
    });

    test("get all topics", async () => {
        const response = await request(app)
            .get("/topics")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // array
        expect(typeof response.body).toBe("object");
    });

    test("create a topic then delete it by ID", async () => {
        const topicName = "jest-unit-test-topic";
        // step 1 - delete the requested topic
        // status != 200 is fine since it might not exist
        await request(app)
            .delete(`/topics?name=${topicName}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/);

        const response = await request(app)
            .post("/topics")
            .send({
                name: topicName,
                username: USERNAME,
                description: "a sample topic",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(response.body.status).toBe("success");
        const topicID = response.body.insert_id;
        expect(typeof topicID).toBe("number");

        const deleteRes = await request(app)
            .delete(`/topics/${topicID}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(deleteRes.body.status).toBe("success");
    });
});

describe("/bow", () => {
    test("get all BoWs", async () => {
        const response = await request(app)
            .get("/bow")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        // array
        expect(typeof response.body).toBe("object");
    });
});

describe("/refs", () => {
    test("get refs for specific username", async () => {
        const response = await request(app)
            .get("/refs")
            .send({username: USERNAME})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        // array
        expect(typeof response.body).toBe("object");
    });

    test("get all refs", async () => {
        const response = await request(app)
            .get("/refs")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        // array
        expect(typeof response.body).toBe("object");
    });

    test("create a ref without associated BoW", async () => {
        const res = await request(app)
            .post("/refs")
            .send({name: "jest-unit-test-ref", username: USERNAME})
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.status).toBe("success");
        expect(res.body.bow_id).toBeNull();
        expect(res.body.created_bow).toBe(false);
    });

    test("create a ref with an associated BoW that does not exist", async () => {
        const refName = "jest-unit-test-ref";
        const bowName = "jest-unit-test-bow";

        // delete any refs with this name first
        // the reference may not be found, which is fine
        await request(app)
            .delete(`/refs?name=${refName}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/);

        // the BoW may not be found, which is fine
        await request(app)
            .delete(`/bow?name=${bowName}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/);

        const res = await request(app)
            .post("/refs")
            .send({
                name: refName,
                username: USERNAME,
                body_of_work: "jest-unit-test-bow"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
        expect(res.body.status).toBe("success");
        expect(res.body.bow_id).not.toBeNull();
        expect(res.body.created_bow).toBe(true);
    });
});
