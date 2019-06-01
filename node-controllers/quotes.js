const { Router } = require("express");
const { Quote, User, Project, Publication, tables } = require("./db-common");
const myPassport = require("./my-passport");
const { check, validationResult } = require("express-validator/check");

const router = new Router();

const sendError = (res, code, msg) => {
    return res.status(code).json({
        status: "error",
        msg: msg
    });
};

router.get("/:id", myPassport.authOrFail, async(req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    const quote = await Quote.where({
        user: user.get("id"),
        id: req.params.id
    }).fetch();
    if(quote) {
        return res.json(quote);
    } else {
        return sendError(res, 404, "Quote with this ID either does not exist or does not belong to you");
    }
});

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    let quotes = [];
    if(req.query.project) {
        const project = await Project.where({
            user: user.get("id"),
            id: req.query.project,
        }).fetch();
        if(project) {
            quotes = await Quote.where({
                user: user.get("id"),
                project: project.get("id"),
            }).fetchAll({
                withRelated: [tables.publications]
            });
        } else {
            return sendError(res, 404, `Project with ID ${req.query.project} either does not exist or does not belong to you`);
        }
    } else {
        // fetch ALL quotes
        quotes = await Quote.where({user: user.get("id")}).fetchAll({
            withRelated: [tables.publications]
        });
    }
    if(!quotes) {
        quotes = [];
    }
    return res.json(quotes);
});

router.post("/:id", myPassport.authOrFail,
    [
        check("quote").exists(),
        check("project").exists().isInt(),
        check("publication").exists().isInt(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
            });
        }
        const user = await User.where({email: req.session.email}).fetch();

        const quote = await Quote.where({
            user: user.get("id"),
            id: req.params.id
        }).fetch();
        if(!quote) {
            return sendError(res, 404, "Quote with this ID either does not exist or does not belong to you");
        }

        const projectID = req.body.project;
        if(projectID !== quote.get("project")) {
            const project = await Project.where({
                user: user.get("id"),
                id: projectID,
            }).fetch();
            if(!project) {
                return res.status(404).json({
                    status: "error",
                    msg: `project with ID ${projectID} not found for this user`
                });
            }
        }

        const pubID = req.body.publication;
        if(pubID !== quote.get("publication")) {
            const pub = await Publication.where({
                user: user.get("id"),
                id: pubID,
            }).fetch();
            if(!pub) {
                return res.status(404).json({
                    status: "error",
                    msg: `publication with ID ${pubID} not found for this user`
                });
            }
        }

        quote.set({
            quote: req.body.quote,
            user: user.get("id"),
            project: projectID,
            publication: pubID,
        });
        try {
            await quote.save();
            return res.json({
                status: "success",
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                status: "error",
                msg: e
            });
        }
    }
);

router.post("/",
    myPassport.authOrFail,
    [
        check("quote").exists(),
        check("project").exists().isInt(),
        check("publication").exists().isInt(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                errors: errors.array()
            });
        }
        const user = await User.where({email: req.session.email}).fetch();
        const project = await Project.where({
            user: user.get("id"),
            id: req.body.project,
        }).fetch();
        if(!project) {
            return res.status(400).json({
                status: "error",
                msg: `project with ID ${req.body.project} not found for this user`
            });
        }
        const publication = await Publication.where({
            user: user.get("id"),
            id: req.body.publication,
        }).fetch();
        if(!publication) {
            return res.status(400).json({
                status: "error",
                msg: `publication with ID ${req.body.publication} not found for this user`
            });
        }

        const quote = new Quote({
            quote: req.body.quote,
            user: user.get("id"),
            project: project.get("id"),
            publication: publication.get("id"),
        });
        await quote.save();
        return res.json({
            status: "success",
            insert_id: quote.get("id")
        });
    }
);

module.exports = router;
