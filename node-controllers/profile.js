const { Router } = require("express");
const myPassport = require("./my-passport");
const { User } = require("./db-common");
const { check, validationResult } = require("express-validator/check");
const authBackend = require("./auth-backend");

const router = Router();

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    return res.json(user);
});

router.post("/", myPassport.authOrFail,
    [
        check("name").exists(),
        check("email").exists().isEmail(),
        check("password").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
            });
        }

        // use session email to do auth instead of passed email
        const match = await authBackend.authUser(req.session.email, req.body.password);
        if(match) {
            const user = await User.where({email: req.session.email}).fetch();
            user.set({
                name: req.body.name,
                email: req.body.email,
            });
            await user.save();

            // change the name and email in the session
            req.session.email = user.get("email");
            req.session.name = user.get("name");

            return res.json({
                status: "success"
            });
        } else {
            return res.status(401).json({
                status: "error",
                msg: "the password is incorrect",
            }).end();
        }
    }
);

module.exports = router;