var Sequelize = require('sequelize');
var Models    = require('./models');

module.exports = function() {
    var connectionString;

    if (process.env.MYSQLCONNSTR_localdb) {
        process.env.MYSQLCONNSTR_localdb.split(";").forEach(function (item) {
            var string = item.split("=");
            if (string[0] === "Password") {
                connectionString = "mysql://root:root@localhost:54454/localdb";
            }
        })
    } else {
        connectionString = "mysql://root:root@localhost:3306/regexp";
    }

    console.log(connectionString);

    var sequelize = new Sequelize(connectionString);

    sequelize.authenticate().then(function (result) {console.log('RESULT ' + result)});

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
