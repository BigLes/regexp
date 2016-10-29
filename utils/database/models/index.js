/**
 * Created by Oleksandr Lisovyk on 29.10.2016.
 */
'use strict';

var fs      = require("fs");
var path    = require("path");

var models  = {};

module.exports = function (sequelize) {
    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function(file) {
            var model = sequelize.import(path.join(__dirname, file));
            models[model.name] = model;
        });

    sequelize.sync();

    return models;
};
