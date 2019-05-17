const EMAIL = "testing@fakeemail.com";
const PASSWORD = "hello world";
const NAME = "Test Testerson";

const Auth = require("../node-controllers/auth-backend");

describe("createAccount", () => {
    test("create an account successfully", async () => {
        // step 1 - delete the testing user (if present)
        // ignore return value
        await Auth.deleteUserByEmail(EMAIL);
        // step 2 - create the new user
        const user = await Auth.createUser(EMAIL, PASSWORD, NAME);
        // and make sure the user was in fact created
        expect(user).not.toBeNull();
    });

    afterAll(async () => {
        await Auth.deleteUserByEmail(EMAIL);
    });
});

describe("login", () => {
    afterAll(async () => {
        await Auth.deleteUserByEmail(EMAIL);
    });

    beforeEach(async() => {
        await Auth.deleteUserByEmail(EMAIL);
    });

    test("fail to login with bad credentials", async () => {
        // step 1 - delete the testing user (if present)
        // ignore return value
        await Auth.deleteUserByEmail(EMAIL);
        // now try to login as the deleted user
        const result = await Auth.authUser(EMAIL, PASSWORD);
        expect(result).toBe(false);
    });

    test("fail to login with incorrect password", async () => {
        let user = await Auth.createUser(EMAIL, PASSWORD, NAME);
        // if the user already exists, that's fine just fetch it
        if(!user) {
            user = await Auth.getUserByEmail(EMAIL);
        }
        expect(user).not.toBeNull();
        const result = await Auth.authUser(EMAIL, PASSWORD + "x");
        expect(result).toBe(false);
    });

    test("login with correct password", async () => {
        let user = await Auth.createUser(EMAIL, PASSWORD, NAME);
        // if the user already exists, that's fine just fetch it
        if(!user) {
            user = await Auth.getUserByEmail(EMAIL);
            console.log("User already exists, fetched user from database");
            // console.log(user);
        } else {
            console.log("Successfully created new user");
            // console.log(user);
        }
        expect(user).not.toBeNull();
        const result = await Auth.authUser(EMAIL, PASSWORD);
        expect(result).toBe(true);
    });
});
