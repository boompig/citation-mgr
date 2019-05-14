const User = require("./db-common").User;

/**
 * This endpoint is for logging in as a specific user
 * There is no real security (no password)
 * Create the user and walk right in
 */
exports.addUser = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({
            status: "error",
            msg: "name parameter is required but not specified"
        }).end();
    }

    try {
        const user = await User.where({name: req.body.name}).fetch();
        return res.json({
            status: "success",
            msg: `logged in as ${req.body.name}`,
            is_admin: user.is_admin
        });
    } catch(e) {
        console.warn(`Failed to locate user with name ${req.body.name}`);
        // return res.status(401).json({
        //     status: "error",
        //     msg: `Failed to locate user with name ${req.body.name}`,
        // }).end();

        // create the user
        // note that the user will *not* have admin rights here

        const user = new User({
            name: req.body.name,
            is_admin: false,
        });
        console.log("saving user...");

        await user.save();

        return res.json({
            status: "success",
            msg: `created new user with name ${req.body.name}`,
        }).end();
    }
};
