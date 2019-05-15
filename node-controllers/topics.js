const express = require("express");
const { Topic, User } = require("./db-common");
const authRouter = require("./my-passport");

const router = express.Router();

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get("/", authRouter.authOrFail, async (req, res) => {
    if(!req.session) {
        // catches case when session middleware not loaded properly
        const errorMsg = "Session not set when fetching topics";
        console.error(errorMsg);
        return res.status(500).json("server error");
    }
    const user = await User.where({email: req.session.email}).fetch();
    if(!user) {
        const errorMsg = "Could not locate user when fetching topics";
        console.warn(errorMsg);
        return res.status(500).json(errorMsg);
    }
    const topics = await Topic.where({user: user.get("id")}).fetchAll();
    return res.json(topics).end();
});

router.delete("/:id", authRouter.authOrFail, async (req, res) => {
    // make sure the id is provided
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No topic id provided"});
    }
    try {
        const topic = await Topic.where({id: req.params.id}).fetch();
        await topic.destroy();
        return res.json({
            status: "success",
            msg: "deleted topic"
        });
    } catch(e) {
        console.error(e);
        return res.status(404).json({
            status: "error",
            msg: `No topic with ID ${req.params.id}`
        });
    }
});

/**
 * Required parameters:
 * 		- name
 * 		- username
 *
 * Optional parameters:
 * 		- description
 */
router.post("/", authRouter.authOrFail, async (req, res) => {
    // name must be specified for topic
    if (!req.body.name) {
        return res.status(400).json({
            status: "error", msg: "name is required"
        });
    }
    const user = await User.where({email: req.session.email}).fetch();
    const topic = new Topic({
        name: req.body.name,
        description: req.body.description,
        user: user.get("id"),
    });
    try {
        await topic.save();

        const topicID = topic.get("id");

        return res.json({
            status: "success",
            insert_id: topicID
        });
    } catch(e) {
        console.error(`Failed to add topic with duplicate name ${req.body.name}`);
        return res.status(500).json({
            status: "error",
            msg: `Failed to add topic with duplicate name ${req.body.name}`
        });
    }
});

module.exports = router;
