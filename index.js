var express = require('express');
var DB      = require('./utils/database');
var fs      = require('fs');
var Puzzle  = require('./utils/puzzle');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({extended: false});
var puzzle = new Puzzle();
var db = new DB();
/**
 *  Define the sample application.
 */
var App = function() {
    var self = this;

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        self.cache = {};
        self.cache['index'] = fs.readFileSync('./regexp/static/html/index.html');
        self.cache['empty_puzzle'] = JSON.stringify(puzzle.getEmptyPuzzle());
        db.findAll(function (err, data) {
            self.cache['ids'] = !data.filter ? [] : data.filter(function (item) {
                if (item.time) {
                    return item;
                }
            }).map(function (item) {
                return item.time;
            });
        });
        self.cache.get = function (key) {
            return self.cache[key];
        }
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */
    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.app.get('/regexp', function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache.get('index'));
        });
        self.app.get('/regexp/create', function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.render('puzzle', {
                script: self.cache.get('empty_puzzle'),
                rule: "<input maxlength='25' />",
                solve: false,
                left: false,
                right: false,
                type: 7
            });
        });
        self.app.get('/regexp/solve', function(req, res) {
            var puzzle = new Puzzle(),
                query = {},
                ids = self.cache.get('ids'),
                left = false,
                right = false,
                pos;
            if (req.query.id) {
                query.time = req.query.id;
            } else if (ids) {
                query.time = ids[0];
            }
            if (ids) {
                pos = ids.indexOf(parseInt(query.time));
                if (pos >= 0) {
                    if (ids[pos - 1]) {
                        left = {
                            href: "solve?id=" + ids[pos - 1]
                        }
                    }
                    if (ids[pos + 1]) {
                        right = {
                            href: "solve?id=" + ids[pos + 1]
                        }
                    }
                }
            }
            db.find(query, function (err, data) {
                if (data) {
                    res.render('puzzle', {
                        script: JSON.stringify(data),
                        rule: "<span></span>",
                        solve: true,
                        left: left,
                        right: right,
                        type: data.count
                    });
                } else {
                    res.render('error', {
                        error: "error 404: page not found"
                    });
                }
            });
        });
        self.app.post('/regexp/api/puzzle', urlencodedParser, function(req, res) {
            var toSave = {};
            if (req.body.data) {
                toSave = JSON.parse(req.body.data);
                toSave.time = (new Date()).getTime();
                db.save(toSave, function (err, message, doc) {
                    self.cache['ids'].push(toSave.time);
                    res.setHeader('Content-Type', 'text/html');
                    if (err) {} else {
                        res.send(message + "/" + doc.time);
                    }
                });
            }
        });
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function(server) {
        self.app = server;
        self.setupMiddleWare();
        self.createRoutes();
    };

    /**
     *  Setup middleware of application
     */
    self.setupMiddleWare = function () {
        function ieRedirecter(req, res, next) {
            if(req.headers['user-agent'].indexOf("MSIE") >= 0) {
                var myNav = req.headers['user-agent'];
                var IEbrowser = parseInt(myNav.split('MSIE')[1]);
                if(IEbrowser <= 9) {
                    res.render('error', {
                        error: "old browser: use new one"
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
        }
        self.app.use(express.static("regexp/static"));
        self.app.set('views', 'regexp/views');
        self.app.set('view engine', 'ejs');
        self.app.use(ieRedirecter);
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function(server) {
        self.populateCache();
        self.initializeServer(server);
    };
};

module.exports = function (server) {
    var app = new App();
    app.initialize(server);
};
