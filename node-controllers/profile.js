const { Router } = require("express");
const authRouter = require("./my-passport");
const { User } = require("./db-common");

const router = Router();

router.get("/", authRouter.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    return res.json(user);
});

module.exports = router;