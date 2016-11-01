var Sequelize = require('sequelize');
var Models    = require('./models');

module.exports = function() {
    var sequelize;

    if (process.env.MYSQLCONNSTR_localdb) {
        process.env.MYSQLCONNSTR_localdb.split(";").forEach(function (item) {
            var string = item.split("=");
            if (string[0] === "Password") {
                sequelize = new Sequelize('localdb', 'azure', '6#vWHD_$', {
                    host: 'localhost',
                    dialect: 'mysql',
                    pool: {
                        max: 5,
                        min: 0,
                        idle: 10000
                    }
                });
            }
        })
    } else {
        sequelize = new Sequelize("mysql://root:root@localhost:3306/regexp");
    }

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
