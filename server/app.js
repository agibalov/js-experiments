var express = require("express");
var bodyParser = require("body-parser");
var noteRoutes = require("./routes/notes.js");
var categoryRoutes = require("./routes/categories.js");

module.exports = function(models, config) {
	var app = express();
	app.use(express.static(__dirname + "/../client/build/"));
	app.use(bodyParser.json());
	noteRoutes.addRoutes(app, models, config);
	categoryRoutes.addRoutes(app, models, config);

	["/", "/notes", "/categories"].forEach(function(route) {
		app.all(route, function(req, res) {
			res.sendFile("index.html", { root: __dirname + "/../client/build/" });
		});
	});

	return app;
};
