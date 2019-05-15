const express = require("express");
const { Reference, BodyOfWork, User } = require("./db-common");
const myPassport = require("./my-passport");
// const { check, validationResult } = require('express-validator/check');

const router = express.Router();

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
router.post("/", myPassport.authOrFail,
    // [
    //     check("name").exists(),
    // ],
    async (req, res) => {
        // name must be specified for ref
        if (!req.body.name) {
            return res.status(400).json({
                status: "error",
                msg: "name is required"
            });
        }
        const user = await User.where({email: req.session.email}).fetch();

        let bowID = null;
        let createdBow = false;

        if(req.body.body_of_work) {
            // create the body of work
            let bow = await BodyOfWork.where({name: req.body.body_of_work}).fetch();
            if(!bow) {
                bow = new BodyOfWork({
                    name: req.body.body_of_work,
                    user: user.get("id"),
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
            user: user.get("id")
        });

        try {
            await ref.save();
            return res.json({
                status: "success",
                msg: "Saved reference",
                bow_id: bowID,
                created_bow: createdBow,
                insert_id: ref.get("id"),
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                status: "error",
                msg: "failed to save ref"
            });
        }
    });

router.get("/", myPassport.authOrFail, async (req, res) => {
    const user = await User.where({email: req.session.email}).fetch();
    const refs = await Reference.where({user: user.get("id")}).fetchAll();
    return res.json(refs);
});

router.delete("/:id", myPassport.authOrFail, async (req, res) => {
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
});

module.exports = router;
