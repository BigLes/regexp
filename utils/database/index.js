var mongoose  = require('mongoose');
var Sequelize = require('sequelize');
var Models    = require('./models');

module.exports = function() {
    var mongoConnection;
    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        mongoConnection = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
    } else {
        mongoConnection = "mongodb://localhost:27017/puzzles";
    }

    var sequelize = new Sequelize('mysql://root:root@localhost:3306/regexp');
    var models = new Models(sequelize);

    return {
        saveMongoose: function (model, query, callback) {
            var item = new model(query);
            mongoose.connect(mongoConnection);
            item.save(function (err, doc) {
                mongoose.connection.close();
                if (err) {
                    callback(err, "Not saved");
                    throw err;
                } else {
                    callback(null, "Saved", doc);
                }
            });
        },
        findMongoose: function (model, query, callback) {
            mongoose.connect(mongoConnection);
            model.findOne(query, {_id: 0, __v: 0, strings: 0}, function (err, doc) {
                mongoose.connection.close();
                callback(err, doc);
            })
        },
        findAllMongoose: function (model, query, callback) {
            mongoose.connect(mongoConnection);
            model.find(query, {_id: 0, count: 0, strings: 0, rules: 0, __v: 0}, function (err, doc) {
                mongoose.connection.close();
                callback(err, doc);
            })
        },
        save: function (query, callback) {
            console.log(query);
            return models.puzzle.create(query)
                .then(function (record) {callback(null, "Saved", record)})
                .catch(function (error) {callback(error, "Not saved")});
        },
        find: function (query, callback) {
            return models.puzzle.findOne(query).then(function (record) {
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
