var cruft = require("./pg_cruft.js");
const dbCommon = require("./db-common");
const Reference = dbCommon.Reference;
const BodyOfWork = dbCommon.BodyOfWork;

exports.addRef = async (req, res) => {
    // name must be specified for ref
    if (!req.body.name) {
        return res.json({
            status: "error",
            msg: "Empty ref name provided"
        });
    } else if (!req.body.username) {
        return res.send({
            status: "error",
            msg: "username for ref not provided"
        });
    }

    let bowID = null;

    if(req.body.body_of_work) {
        // create the body of work
        let bow = await BodyOfWork.where({name: req.body.body_of_work}).fetchOne({required: true});
        if(!bow) {
            bow = new BodyOfWork({
                name: req.body.body_of_work
            });
            console.log(`Creating new BoW with name ${req.body.body_of_work}...`);
            await bow.save();
            bowID = bow.get("id");
            console.log(`BoW ID is ${bowID}`);
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
    });
};

exports.getRefs = async (req, res) => {
    let refs = [];
    if (req.query.username) {
        console.log(`Fetching all refs for user ${req.query.username}...`);
        refs = await Reference.where({username: req.query.username}).fetchAll();
    } else {
        console.log("Fetching all refs for all users...");
        refs = await Reference.fetchAll();
    }
    console.log(`Pulled ${refs.length} references`);
    return res.json(refs);
};

exports.deleteRef = function (request, response, next, conString) {
    "use strict";
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No ref id provided"});
        return console.error("Ref ID not provided in request");
    }

    var query = "DELETE FROM refs WHERE id=$1";
    var data = [request.params.id];
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Deleted %d rows", result.rowCount);
            response.send({ status: "success" });
        }
    });
};
