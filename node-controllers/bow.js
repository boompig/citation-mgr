const { Router } = require("express");
const { BodyOfWork, User } = require("./db-common");
const myPassport = require("./my-passport");

const router = new Router();

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    let works = await BodyOfWork.where({user: user.get("id")}).fetch();
    if(!works) {
        works = [];
    }
    return res.json(works);
});

router.delete("/:id", myPassport.authOrFail, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No BoW id provided"
        });
    }
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

router.post("/", myPassport.authOrFail, async (req, res) => {
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
