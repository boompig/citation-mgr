/**
 * NOTE: this is super unsafe
 * In order to make it more safe, restrict this functionality to admins only
 */

const { Router } = require("express");
const myPassport = require("./my-passport");
const sqlBackend = require("./query");
const { conString, User } = require("./db-common");

const router = new Router();

const checkIfAdmin = async (req, res, next) => {
    const user = await User.where({email: req.session.email}).fetch();
    if(user.get("is_admin")) {
        next();
    } else {
        return res.status(403).json({
            status: "unauthorized",
            msg: "only admins can run bare SQL queries"
        });
    }
};

router.post("/",
    myPassport.authOrFail,
    checkIfAdmin,
    async (req, res) => {
        return sqlBackend.runQuery(req, res, conString);
    });

router.get("/",
    myPassport.authOrFail,
    checkIfAdmin,
    async (req, res) => {
        return sqlBackend.getQueries(req, res, conString);
    });

router.delete("/:id",
    myPassport.authOrFail,
    checkIfAdmin,
    async (req, res) => {
        return sqlBackend.deleteQuery(req, res, conString);
    });

module.exports = router;
