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
        puzzle.update({rules: {"x": ["/[^X]*(DN|TE|NI)/g", "/[RONMHC]*I[RONMHC]*/g", "/.*(..)\\\\1P/g", "/(E|RC|NM)*/g", "/([^MC]|MM|CC)*/g", "/R?(CR)*MC[MA]*/g", "/.*/g", "/.*CDD.*RRP.*/g", "/(XHH|[^XH])*/g", "/([^CME]|ME)*/g", "/.*RXO.*/g", "/.*LR.*RL.*/g", "/.*EU.*ES.*/g"], "y": ["/.*H.*H.*/g", "/(DI|NS|TH|OM)*/g", "/F.*[AO].*[AO].*/g", "/(O|RHH|MM)*/g", "/.*/g", "/C*MC(CCC|MM)*/g", "/[^C]*[^R]*III.*/g", "/(...?)\\\\1*/g", "/([^X]|XCC)*/g", "/(RR|HHH)*.?/g", "/N.*X.X.X.*E/g", "/R*D*M*/g", "/.(C|HH)*/g"], "z": ["/.*H.*V.*G.*/g", "/[RC]*/g", "/M*XEX.*/g", "/.*MCC.*DD.*/g", "/.*X.*RCHX.*/g", "/.*(.)(.)(.)(.)\\\\4\\\\3\\\\2\\\\1.*/g", "/(NI|ES|IH).*/g", "/[^C]*MMM[^C]*/g", "/.*(.)X\\\\1C\\\\1.*/g", "/[ROMEA]*HO[UMIEC]*/g", "/(XR|[^R])*/g", "/[^M]*M[^M]*/g", "/(S|MM|HHH)*/g"]}})
        console.log(puzzle);
    });

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
