const { Router } = require("express");
const authBackend = require("./auth-backend");
// const { check, validationResult } = require("express-validator/check");

const router = Router();

/**
 * This is the login *endpoint*
 * Required parameters:
 *  - email
 *  - password
 *
 * Returns on success (200):
 *  - status: "success"
 *  - is_admin:             bool
 *  - name: string          the name of the user
 */
router.post("/login",
    async (req, res) => {
        // TODO: move parameter validation to middleware
        if (!req.body.email) {
            return res.status(400).json({
                status: "error",
                msg: "email parameter is required but not specified"
            }).end();
        } else if(!req.body.password) {
            return res.status(400).json({
                status: "error",
                msg: "password parameter is required but not specified"
            }).end();
        }

        const match = await authBackend.authUser(req.body.email, req.body.password);
        if (match) {
            const user = await authBackend.getUserByEmail(req.body.email);
            if(!user) {
                console.error("Failed to find user despite authentication");
                return res.status(500).json({
                    status: "fucked"
                });
            }
            // set the session
            req.session.email = user.get("email");
            req.session.name = user.get("name");
            return res.json({
                status: "success",
                msg: `logged in as ${req.body.email}`,
                is_admin: user.get("is_admin"),
                name: user.get("name"),
            });
        } else {
            const errorMsg = `User with email ${req.body.email} either does not exist or the password is incorrect`;
            console.warn(errorMsg);
            return res.status(401).json({
                status: "error",
                msg: errorMsg,
            }).end();
        }
    }
);

/**
 * @param {Request} req
 * @param {Response} res
 *
 * Required params:
 *  - email
 *  - password
 *  - name
 *
 * Returns on success (200):
 *  - status: "success"
 *  - is_admin: bool
 *  - name: string          name of the user
 */
router.post("/register", async (req, res) => {
    const requiredParams = ["email", "password", "name"];
    for(const param of requiredParams) {
        if(!req.body.hasOwnProperty(param)) {
            return res.status(400).json({
                status: "error",
                msg: `${param} parameter is required but not specified`
            }).end();
        }
    }

    const user = await authBackend.createUser(req.body.email, req.body.password, req.body.name);
    if(user) {
        return res.json({
            status: "success",
            is_admin: user.get("is_admin"),
            name: user.get("name"),
        });
    } else {
        const errorMsg = `User with email ${req.body.email} already exists`;
        console.warn(errorMsg);
        return res.status(401).json({
            status: "error",
            msg: errorMsg,
        }).end();
    }
});

module.exports = router;