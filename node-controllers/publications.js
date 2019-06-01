const { Router } = require("express");
const { Publication, User } = require("./db-common");
const myPassport = require("./my-passport");
const { check, validationResult } = require("express-validator/check");

const router = new Router();

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    let pubs = await Publication.where({user: user.get("id")}).fetchAll();
    if(!pubs) {
        pubs = [];
    }
    return res.json(pubs);
});

router.get("/:id", myPassport.authOrFail, async(req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    const quote = await Publication.where({
        user: user.get("id"),
        id: req.params.id
    }).fetch();
    if(quote) {
        return res.json(quote);
    } else {
        return res.status(404).json({
            status: "error",
            msg: "Publication with this ID either does not exist or does not belong to you",
        });
    }
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

router.post("/",
    myPassport.authOrFail,
    [
        check("name").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
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
    }
);

router.post("/:id",
    myPassport.authOrFail,
    [
        check("name").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
            });
        }
        const user = await User.where({email: req.session.email}).fetch();
        const pub = await Publication.where({
            id: req.params.id,
            user: user.get("id"),
        }).fetch();
        if(!pub) {
            return res.status(404).json({
                status: "error",
                msg: `no publication with ID ${req.params.id}`
            });
        }

        pub.set({
            name: req.body.name,
        });

        await pub.save();

        return res.json({
            status: "success",
        });
    }
);

module.exports = router;
