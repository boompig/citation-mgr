const { Router } = require("express");
const { BodyOfWork, User } = require("./db-common");
const authRouter = require("./my-passport");

const router = new Router();

router.get("/", authRouter.authOrFail, async (req, res) => {
    const works = await BodyOfWork.fetchAll();
    return res.json(works);
});

router.delete("/:id", authRouter.authOrFail, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No BoW id provided"
        });
    }
    // console.log(`Deleting BoW with ID ${req.params.id}`);
    const bow = await BodyOfWork.where({id: req.params.id}).fetch();
    if(bow) {
        await bow.destroy();
        return res.json({
            status: "success"
        });
    } else {
        return res.status(404).json({
            status: "error",
            msg: `No BoW with ID ${req.params.id}`
        });
    }
});

router.post("/", authRouter.authOrFail, async (req, res) => {
    if(!req.body.name) {
        return res.status(400).json({
            status: "error",
            msg: "name is required"
        });
    }
    const user = await User.where({email: req.session.email}).fetch();
    if(!user) {
        console.error("Failed to get user after authentication");
        return res.status(500).json({
            status: "fucked"
        });
    }
    const bow = new BodyOfWork({
        name: req.body.name,
        user: user.get("id"),
    });
    await bow.save();
    return res.json({
        status: "success",
        insert_id: bow.get("id"),
    });
});

module.exports = router;
