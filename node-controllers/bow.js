const dbCommon = require("./db-common");
const BodyOfWork = dbCommon.BodyOfWork;

/*
 * conString is the postgres connection string
 */
exports.getWorks = async (req, res) => {
    const works = await BodyOfWork.fetchAll();
    return res.json(works);
};

exports.deleteWork = function (request, response, next, conString) {
    console.log(conString);
    //TODO not done
};

exports.addWork = function(request, response, next, conString) {
    console.log(conString);
    //TODO not done
};
