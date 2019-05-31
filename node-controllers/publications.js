const { Router } = require("express");
const { Publication, User } = require("./db-common");
const myPassport = require("./my-passport");

const router = new Router();

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    let pubs = await Publication.where({user: user.get("id")}).fetchAll();
    if(!pubs) {
        pubs = [];
    }
    return res.json(pubs);
});

router.delete("/:id", myPassport.authOrFail, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No publication id provided"
        });
    }
    const pub = await Publication.where({id: req.params.id}).fetch();
    if(pub) {
        await pub.destroy();
        return res.json({
            status: "success"
        });
    } else {
        return res.status(404).json({
            status: "error",
            msg: `No publication with ID ${req.params.id}`
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
    const pub = new Publication({
        name: req.body.name,
        user: user.get("id"),
    });
    await pub.save();
    return res.json({
        status: "success",
        insert_id: pub.get("id"),
    });
});

module.exports = router;
