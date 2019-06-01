const { Router } = require("express");
const { User, tables, knex } = require("./db-common");
const myPassport = require("./my-passport");
// const { check, validationResult } = require("express-validator/check");

const router = new Router();

router.get("/",
    myPassport.authOrFail,
    async(req, res) => {
        const user = await User.where({email: req.session.email}).fetch();
        const query = `select distinct(source_title) from ${tables.quotes} where "user"=? and source_title is not null`;
        const result = await knex.raw(query, user.get("id"));
        const articles = result.rows.map((row) => row.source_title);
        return res.json(articles);
    }
);

module.exports = router;