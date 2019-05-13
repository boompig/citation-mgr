const { BodyOfWork } = require("./db-common");

/*
 * conString is the postgres connection string
 */
exports.getWorks = async (req, res) => {
    const works = await BodyOfWork.fetchAll();
    return res.json(works);
};

// TODO: add some security here
exports.deleteByName = async (req, res) => {
    if (!req.query.name) {
        return res.status(400).json({
            status: "error",
            msg: "name is a required parameter"
        });
    }
    console.log(`Deleting BoW with name ${req.query.name}...`);
    const bow = await BodyOfWork.where({name: req.query.name}).fetch();
    if (bow) {
        await bow.destroy();
        console.log("Successfully deleted BoW");
        return res.json({
            status: "success"
        });
    } else {
        console.error(`No BoW with name ${req.query.name}`);
        return res.status(404).json({
            status: "error",
            msg: `No BoW with name ${req.query.name}`
        });
    }
};

exports.deleteById = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            status: "error", msg: "No BoW id provided"
        });
    }
    console.log(`Deleting BoW with ID ${req.params.id}`);
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
};

exports.addWork = function(request, response, next, conString) {
    console.log(conString);
    //TODO not done
};
