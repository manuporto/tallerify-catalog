"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var logger = require("morgan");
var path = require("path");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var index_1 = require("./routes/index");
/**
 * The server.
 *
 * @class Server
 */
var Server = (function () {
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    function Server() {
        //create expressjs application
        this.app = express();
        //configure application
        this.config();
        //add routes
        this.routes();
        //add api
        this.api();
    }
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    Server.bootstrap = function () {
        return new Server();
    };
    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    Server.prototype.api = function () {
        //empty for now
    };
    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    Server.prototype.config = function () {
        //add static paths
        this.app.use(express.static(path.join(__dirname, "public")));
        //configure pug
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");
        //mount logger
        this.app.use(logger("dev"));
        //mount json form parser
        this.app.use(bodyParser.json());
        //mount query string parser
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        //mount cookie parker
        this.app.use(cookieParser("SECRET_GOES_HERE"));
        //mount override?
        this.app.use(methodOverride());
        // catch 404 and forward to error handler
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        //error handling
        this.app.use(errorHandler());
    };
    /**
     * Create and return Router.
     *
     * @class Server
     * @method config
     * @return void
     */
    Server.prototype.routes = function () {
        var router;
        router = express.Router();
        //IndexRoute
        index_1.IndexRoute.create(router);
        //use router middleware
        this.app.use(router);
    };
    return Server;
}());
exports.Server = Server;
