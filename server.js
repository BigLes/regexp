#!/bin/env node
//  OpenShift sample Node application
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
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1:5000');
            self.develop = true;
            self.ipaddress = "127.0.0.1";
            self.port = 5000;
        }
    };

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        self.cache = {};
        self.cache['index'] = fs.readFileSync('./static/html/index.html');
        self.cache['empty_puzzle'] = JSON.stringify(puzzle.getEmptyPuzzle());
        db.findAll(puzzle.getMongooseModel(), {}, function (err, data) {
            self.cache['ids'] = data.filter(function (item) {
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

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string|boolean} sig  Signal to terminate on.
     */
    self.terminator = function (sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        var sigs = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];
        process.on('exit', function() {self.terminator(false);});

        sigs.forEach(function(element) {
            process.on(element, function() {self.terminator(element);});
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */
    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.getRoutes = {};
        self.postRoutes = {};
        self.staticRoutes = {};

        self.getRoutes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache.get('index'));
        };
        self.getRoutes['/create'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.render('puzzle', {
                script: self.cache.get('empty_puzzle'),
                rule: "<input maxlength='25' />",
                solve: false,
                left: false,
                right: false,
                type: 7
            });
        };
        self.getRoutes['/solve'] = function(req, res) {
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
            db.find(puzzle.getMongooseModel(), query, function (err, data) {
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
        };
        self.postRoutes['/save'] = function(req, res) {
            var toSave = {};
            if (req.body.data) {
                toSave = JSON.parse(req.body.data);
                toSave.time = (new Date()).getTime();
                db.save(puzzle.getMongooseModel(), toSave, function (err, message, doc) {
                    self.cache['ids'].push(toSave.time);
                    res.setHeader('Content-Type', 'text/html');
                    if (err) {} else {
                        res.send(message + "/" + doc.time);
                    }
                });
            }
        };

        self.staticRoutes["/style"] = "/static/style";
        self.staticRoutes["/script"] = "/static/script";
        self.staticRoutes["/pictures"] = "/static/pictures";
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        var r;
        self.app = express();
        self.createRoutes();
        self.setupMiddleWare();

        for (r in self.getRoutes) {
            self.app.get(r, self.getRoutes[r]);
        }
        for (r in self.postRoutes) {
            self.app.post(r, urlencodedParser, self.postRoutes[r]);
        }
        self.app.get("*", function (req, res) {
            res.render('error', {
                error: "error 404: page not found"
            });
        })
    };

    /**
     *  Setup middleware of application
     */
    self.setupMiddleWare = function () {
        function allowCrossDomain(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        }
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
        if (self.develop) {
            self.app.use(allowCrossDomain);
        }
        self.app.use(express.static("static"));
        self.app.set('view engine', 'ejs');
        self.app.use(ieRedirecter);
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddress, self.port);
        });
    };
};

/**
 *  main():  Main code.
 */
var app = new App();
app.initialize();
app.start();