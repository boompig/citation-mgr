const { Location, User } = require("./db-common");

exports.addLocation = async (request, response) => {
    if (!request.body.quote) {
        return response.send({
            status: "error",
            msg: "quote is a required parameter"
        });
    }

    const user = await User.where({email: request.session.email}).fetch();

    const loc = new Location({
        ref: request.body.ref,
        section: request.body.section,
        quote: request.body.quote,
        body_of_work: request.body.body_of_work,
        topic: request.body.topic,
        user: user.get("id"),
    });

    await loc.save();

    return response.json({
        status: "success",
        insert_id: loc.get("id"),
    });
};

exports.getLocations = async (request, response) => {
    const user = await User.where({email: request.session.email}).fetch();
    let locs = await Location.where({user: user.get("id")}).fetchAll();
    if(!locs) {
        locs = [];
    }
    return response.json(locs);
};

exports.deleteLocation = async (request, response) => {
    // make sure the id is provided
    if (!request.params.id) {
        return response.status(400)
            .json({
                status: "error",
                msg: "No location id provided"
            });
    }

    const user = await User.where({email: request.session.email}).fetch();
    const loc = await Location.where({id: request.params.id}).fetch();
    if(loc) {
        if(loc.get("user") === user.get("id")) {
            await loc.destroy();
            return response.json({status: "success"});
        } else {
            return response.status(403).json({
                status: "error",
                msg: "location does not belong to you"
            });
        }
    } else {
        return response.status(404).json({
            status: "error",
            msg: "location not found"
        });
    }
};
