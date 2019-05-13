const dbCommon = require("./db-common");
const Topic = dbCommon.Topic;

/*
 * conString is the postgres connection string
 */
exports.getTopics = async (req, res) => {
    let topics = [];
    if (req.query.username) {
        topics = await Topic.where({username: req.query.username}).fetchAll();
    } else {
        topics = await Topic.fetchAll();
    }
    return res.json(topics).end();
};

exports.deleteTopic = async (req, res) => {
    // make sure the id is provided
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No topic id provided"});
    }
    console.log(`Deleting topic with ID ${req.params.id}`);
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
};

/**
 * Required parameters:
 * 		- name
 * 		- username
 *
 * Optional parameters:
 * 		- description
 */
exports.addTopic = async (req, res) => {
    // name must be specified for topic
    if (!req.body.name) {
        return res.status(400).send({
            status: "error", msg: "Empty topic name provided"});
    } else if (!req.body.username) {
        return res.status(400).send({
            status: "error", msg: "username for topic not provided"});
    }
    const topic = new Topic({
        name: req.body.name,
        username: req.body.username,
        description: req.body.description,
    });
    try {
        await topic.save();

        const topicID = topic.get("id");

        return res.json({
            status: "success",
            insert_id: topicID
        });
    } catch(e) {
        console.error(`Failed to add topic with name ${req.body.name}`);
        return res.json({
            status: "error",
            msg: `Failed to add topic with duplicate name ${req.body.name}`
        });
    }
};
