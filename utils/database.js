var mongoose = require('mongoose');

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

    return {
        save: function (model, query, callback) {
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
        find: function (model, query, callback) {
            mongoose.connect(mongoConnection);
            model.findOne(query, {_id: 0, __v: 0, strings: 0}, function (err, doc) {
                mongoose.connection.close();
                callback(err, doc);
            })
        },
        findAll: function (model, query, callback) {
            mongoose.connect(mongoConnection);
            model.find(query, {_id: 0, count: 0, strings: 0, rules: 0, __v: 0}, function (err, doc) {
                mongoose.connection.close();
                callback(err, doc);
            })
        }
    }
};
