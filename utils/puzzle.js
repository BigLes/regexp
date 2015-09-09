var mongoose = require('mongoose');
var puzzleSchema = new mongoose.Schema({
    rules: {
        x: [String],
        y: [String],
        z: [String]
    },
    strings: {
        x: [String],
        y: [String],
        z: [String]
    },
    count: Number,
    time: Number
});

module.exports = function (data) {
    var strings,
        rules,
        count,
        checked;

    initialize(data);

    function checkLine (axis, index) {
        var rule = rules[axis][index].substring(1, rules[axis][index].length - 2),
            string = strings[axis][index],
            tempArr;
        checked[axis][index] = false;
        tempArr = string.match(RegExp(rule, "g"));
        if (tempArr) {
            if ((tempArr.indexOf(string) >= 0) && (rule.length <= 25)) {
                checked[axis][index] = true;
            }
        }
    }

    function checkPuzzle () {
        if (checked.result === undefined) {
            checked.result = true;
            for (var i = 12 - (7 - count); i >= (7 - count); i--) {
                checkLine('x', i);
                checkLine('y', i);
                checkLine('z', i);
                if (!checked['x'][i] || !checked['y'][i] || !checked['z'][i]) {
                    checked.result = false;
                    break;
                }
            }
        }
        return checked.result;
    }

    function initialize(d) {
        d = d ? d : {};
        strings = d.strings ? d.strings : [];
        rules = d.rules ? d.rules : [];
        count = d.count ? d.count : 7;
        checked = {
            x: [],
            y: [],
            z: [],
            result: undefined
        };
    }

    return {
        setData: function (data) {
            initialize(data);
        },
        getMongooseModel: function () {
            return mongoose.model('puzzles', puzzleSchema);
        },
        getData: function () {
            return {
                count: count,
                rules: rules,
                strings: strings
            };
        },
        getEmptyPuzzle: function () {
            return {
                rules: {
                    x: [],
                    y: [],
                    z: []
                },
                count: 7
            };
        },
        check: function () {
            return checkPuzzle();
        }
    }
};