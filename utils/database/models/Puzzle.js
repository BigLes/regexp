/**
 * Created by Oleksandr Lisovyk on 29.10.2016.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    var Puzzle = sequelize.define('puzzle', {
        rules: DataTypes.JSON,
        string: DataTypes.JSON,
        count: DataTypes.INTEGER,
        time: DataTypes.BIGINT
    });

    return Puzzle;
};
