var Sequelize = require('sequelize');
var Models    = require('./models');

module.exports = function() {
    var connectionString = "mysql://root:root@localhost:3306/regexp";

    if (process.env.MYSQLCONNSTR_localdb) {
        process.env.MYSQLCONNSTR_localdb.split(";").forEach(function (item) {
            var string = item.split("=");
            if (string[0] === "Password") {
                connectionString = "mysql://azure:" + string[1] + "@localhost:54454/localdb";
            }
        })
    }

    console.log(connectionString);

    console.log(connectionString);

    var sequelize = new Sequelize(connectionString);

    var models = new Models(sequelize);

    return {
        save: function (query, callback) {
            return models.puzzle.create(query)
                .then(function (record) {callback(null, "Saved", record)})
                .catch(function (error) {callback(error, "Not saved")});
        },
        find: function (query, callback) {
            return models.puzzle.findOne({where: query}).then(function (record) {
                if (record) {
                    callback(null, record.dataValues);
                } else {
                    callback('Not found');
                }
            });
        },
        findAll: function (callback) {
            return models.puzzle.findAll({}).then(function (records) {
                if (records.length) {
                    callback(null, records);
                } else {
                    callback('Not found');
                }
            });
        }
    }
};
