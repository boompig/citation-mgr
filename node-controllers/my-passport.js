exports.authOrRedirect = (req, res, next) => {
    if(req.session.email && req.session.name) {
        next();
    } else {
        res.redirect("/login");
    }
};

exports.authOrFail = async (req, res, next) => {
    if(!req.session) {
        console.error("Session variable not available");
        return res.status(500).json({
            status: "fucked"
        });
    }
    if(req.session.email && req.session.name) {
        next();
    } else {
        return res.status(401).json({
            status: "error",
            msg: "not authenticated"
        });
    }
};