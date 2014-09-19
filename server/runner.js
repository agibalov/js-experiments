var makeApp = require("./app.js");
var models = require("./models.js");
var DAO = require("./dao.js").DAO;

models.initialize(function(error) {
	if(error) {
		throw new Error("Failed to initialize models");
	}

	var dao = new DAO(models);
	var app = makeApp(dao, models, {
		delay: 1
	});
	var server = app.listen(3000, function() {
		console.log("Listening at %j", server.address());
	});
});
