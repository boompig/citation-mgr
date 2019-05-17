const { Router } = require("express");
const authBackend = require("./auth-backend");
const { check, validationResult } = require("express-validator/check");

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
    [
        check("email").exists().isEmail(),
        check("password").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
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
router.post("/register",
    [
        check("email").exists().isEmail(),
        check("password").exists(),
        check("name").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
            }).end();
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
    }
);

router.get("/logout", async (req, res) => {
    await req.session.destroy();
    res.redirect("/login");
});

module.exports = router;