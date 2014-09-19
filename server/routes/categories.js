var validator = require("validator");

function intIdOrNull(idString) {
	return validator.isInt(idString) ? validator.toInt(idString) : null;
}

exports.addRoutes = function(app, dao, models) {
	app.get("/api/categories/", function(req, res, next) {
		var criteria = {};
		var nameStartsWith = req.query.nameStartsWith;
		if(nameStartsWith) {
			var lowercaseNameStartsWith = nameStartsWith.toLowerCase();
			criteria = {
				where: ["lower(name) like ?", lowercaseNameStartsWith + '%']
			};
		}

		models.Category.findAll(criteria).success(function(categories) {
			res.status(200).send(categories);
		}).error(function(error) {
			next(error);
		});
	});

	app.get("/api/categories/:id", function(req, res, next) {
		var id = intIdOrNull(req.params.id);
		if(!id) {
			res.status(404).send({
				message: "There's no category " + id
			});
			return;
		}

		models.Category.find(id).success(function(category) {
			if(!category) {
				res.status(404).send({
					message: "There's no category " + id
				});
				return;
			}

			res.status(200).send(category);
		}).error(function(error) {
			next(error);
		});
	});

	app.post("/api/categories/", function(req, res, next) {
		var body = req.body;
		var categoryName = body.name;
		models.Category.find({
			where: {
				name: categoryName
			}
		}).success(function(category) {
			if(category) {
				res.status(409).send({
					message: "Category " + categoryName + " already exists"
				});
				return;
			}

			models.Category.create({ name: body.name }).success(function(category) {
				res.status(201).send(category);
			}).error(function(error) {
				res.status(400).send(error);
			});
		}).error(function(error) {
			next(error);
		});		
	});

	app.delete("/api/categories/:id", function(req, res, next) {
		var id = intIdOrNull(req.params.id);
		if(!id) {
			res.status(404).send({
				message: "There's no category " + id
			});
			return;
		}

		models.Category.find(id).success(function(category) {
			if(!category) {
				res.status(404).send({
					message: "Category " + id + " does not exist"
				});
				return;
			}

			category.destroy().success(function() {
				res.status(200).send({
					message: "Deleted"
				});
			}).error(function(error) {
				next(error);
			});
		}).error(function(error) {
			next(error);
		});
	});

	app.post("/api/categories/:id", function(req, res, next) {
		var id = intIdOrNull(req.params.id);
		if(!id) {
			res.status(404).send({
				message: "There's no category " + id
			});
			return;
		}

		models.Category.find(id).success(function(category) {
			if(!category) {
				res.status(404).send({
					message: "Category " + id + " does not exist"
				});
				return;
			}

			var categoryName = req.body.name;
			models.Category.find({
				where: {
					name: categoryName
				}
			}).success(function(existingCategoryWithDesiredName) {
				if(existingCategoryWithDesiredName && existingCategoryWithDesiredName.id !== id) {
					res.status(409).send({
						message: "Category " + categoryName + " already exists"
					});
					return;
				}

				category.name = categoryName;
				category.save().success(function(category) {
					res.status(200).send(category);
				}).error(function(error) {
					res.status(400).send(error);
				});
			});
		}).error(function(error) {
			next(error);
		});
	});
};
