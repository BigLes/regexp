var Sequelize = require('sequelize');
var Models    = require('./models');

module.exports = function() {
    var sequelize;

    console.log(process.env.MYSQLCONNSTR_localdb);

    if (process.env.MYSQLCONNSTR_localdb) {
        process.env.MYSQLCONNSTR_localdb.split(";").forEach(function (item) {
            var string = item.split("=");
            if (string[0] === "Password") {
                console.log('Password |' + string[1] + '|');
                sequelize = new Sequelize('localdb', 'azure', string[1], {
                    host: 'localhost',
                    dialect: 'mysql',
                    port: 54454
                });
            }
        });
    } else {
        sequelize = new Sequelize("mysql://root:root@localhost:3306/regexp");
    }

    var models = new Models(sequelize);

    models.puzzle.findOne({where: {id: 4}}).then(function (puzzle) {
        console.log(puzzle);
    });

    models.puzzle.destroy({where: {id: {$in: [6,7,8,9,10]}}});

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
