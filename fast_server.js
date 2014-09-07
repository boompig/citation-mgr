var express = require("express");
var app = express();
var port = 8080;

app.use(express.static(__dirname + "/public"));

app.get("/api/test", function (request, response, next) {
    console.log("hit test API endpoint");
    response.send("hi\n");
});

app.listen(port);
console.log("started on port " + port);
