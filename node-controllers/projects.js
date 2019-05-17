const { Router } = require("express");
const { Project, User } = require("./db-common");
const myPassport = require("./my-passport");

const router = new Router();


const sendError = (res, code, msg) => {
    return res.status(code).json({
        msg: msg,
        status: "error"
    });
};

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    let projects = await Project.where({user: user.get("id")}).fetchAll();
    if(!projects) {
        projects = [];
    }
    return res.json(projects);
});

router.get("/:id", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    const project = await Project.where({
        user: user.get("id"),
        id: Number.parseInt(req.params.id),
    }).fetch();
    if(project) {
        return res.json(project);
    } else {
        return sendError(res, 404, "Project with this ID either does not exist or does not belong to you");
    }
});

router.post("/", myPassport.authOrFail, async (req, res) => {
    if(!req.body.name) {
        return res.status(400).json({
            status: "error",
            msg: "name is a required parameter"
        });
    }
    const user = await User.where({email: req.session.email}).fetch();
    if(!user) {
        console.error("Failed to get user after authentication");
        return res.status(500).json({
            status: "fucked"
        });
    }
    const project = new Project({
        name: req.body.name,
        user: user.get("id"),
    });
    try {
        await project.save();
        return res.json({
            status: "success",
            insert_id: project.get("id"),
        });
    } catch(e) {
        console.error(e);
        return res.status(500).json({
            status: "error",
            msg: e
        });
    }
});

router.post("/:id", myPassport.authOrFail, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error",
            msg: "id is a required URL parameter"
        });
    } else if (!req.body.name) {
        return res.status(400).json({
            status: "error",
            msg: "name is a required parameter"
        });
    }
    const user = await User.where({email: req.session.email}).fetch();
    const project = await Project.where({id: req.params.id}).fetch();
    if(project) {
        if(project.get("user") === user.get("id")) {
            project.set({
                name: req.body.name,
            });
            try {
                await project.save();
                return res.json({
                    status: "success",
                });
            } catch(e) {
                console.error(e);
                return res.status(500).json({
                    status: "error",
                    msg: e
                });
            }
        } else {
            return res.status(403).json({
                status: "error",
                msg: "cannot edit a project you do not own",
            });
        }
    } else {
        return res.status(404).json({
            status: "error",
            msg: `No project with ID ${req.params.id}`
        });
    }
});

router.delete("/:id", myPassport.authOrFail, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error",
            msg: "id is a required URL parameter"
        });
    }
    const user = await User.where({email: req.session.email}).fetch();
    const project = await Project.where({id: req.params.id}).fetch();
    if(project) {
        if(project.get("user") === user.get("id")) {
            await project.destroy();
            return res.json({
                status: "success",
            });
        } else {
            return res.status(403).json({
                status: "error",
                msg: "cannot delete a project you do not own",
            });
        }
    } else {
        return res.status(404).json({
            status: "error",
            msg: `No project with ID ${req.params.id}`
        });
    }
});

module.exports = router;
