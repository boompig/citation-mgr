const dbCommon = require("./db-common");
const Reference = dbCommon.Reference;
const BodyOfWork = dbCommon.BodyOfWork;

/**
 * Required parameters in body:
 * 		- name
 *		- username
 *
 * Optional parameters in body:
 * 		- first_author
 * 		- author_group
 * 		- year
 * 		- citation_num
 */
exports.addRef = async (req, res) => {
    // name must be specified for ref
    if (!req.body.name) {
        return res.status(400).json({
            status: "error",
            msg: "Empty ref name provided"
        });
    } else if (!req.body.username) {
        return res.status(400).json({
            status: "error",
            msg: "username for ref not provided"
        });
    }

    let bowID = null;
    let createdBow = false;

    if(req.body.body_of_work) {
        // create the body of work
        let bow = await BodyOfWork.where({name: req.body.body_of_work}).fetch();
        if(!bow) {
            bow = new BodyOfWork({
                name: req.body.body_of_work
            });
            console.log(`Creating new BoW with name ${req.body.body_of_work}...`);
            await bow.save();
            bowID = bow.get("id");
            console.log(`BoW ID is ${bowID}`);
            createdBow = true;
        } else {
            bowID = bow.get("id");
            console.log(`BoW already exists and has ID ${bowID}`);
        }
    }

    const ref = new Reference({
        name: req.body.name,
        first_author: req.body.first_author,
        author_group: req.body.author_group,
        year: req.body.year,
        body_of_work: bowID,
        citation_num: req.body.citation_num,
        username: req.body.username
    });

    await ref.save();
    return res.json({
        status: "success",
        msg: "Saved reference",
        bow_id: bowID,
        created_bow: createdBow,
    });
};

exports.getRefs = async (req, res) => {
    let refs = [];
    if (req.query.username) {
        // console.log(`Fetching all refs for user ${req.query.username}...`);
        refs = await Reference.where({username: req.query.username}).fetchAll();
    } else {
        // console.log("Fetching all refs for all users...");
        refs = await Reference.fetchAll();
    }
    // console.log(`Pulled ${refs.length} references`);
    return res.json(refs);
};

exports.deleteByName = async (req, res) => {
    if (!req.query.name) {
        return res.status(400).json({
            status: "error",
            msg: "name parameter is required"
        });
    }
    // console.log(`Deleting reference with name ${req.query.name}...`);
    const refs = await Reference.where({ name: req.query.name}).fetchAll();
    if(refs) {
        const numDeleted = refs.length;
        for(const ref of refs) {
            await ref.destroy();
        }
        // console.log(`Deleted ${numDeleted} references`);
        return res.json({
            status: "success",
            num_deleted: numDeleted
        });
    } else {
        console.warn(`No reference found with name ${req.query.name}`);
        return res.status(404)
            .json({
                status: "error",
                msg: `No reference found with name ${req.query.name}`
            });
    }
};

exports.deleteById = async (req, res) => {
    if (!req.params.id) {
        return res
            .status(400)
            .json({status: "error", msg: "No ref id provided"});
    }
    const ref = await Reference.where({ id: req.params.id}).fetch();
    if(ref) {
        await ref.destroy();
        return res.json({
            status: "success"
        });
    } else {
        return res.status(404)
            .json({
                status: "error",
                msg: `No reference found with ID ${req.params.id}`
            });
    }
};
