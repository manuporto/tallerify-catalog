/**
 * Load env file
 */
require('dotenv').config();

// *** main dependencies *** //
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


// *** routes *** //
const routes = require('./routes/index.js');


// *** express instance *** //
const app = express();


// *** view engine *** //
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, '../dist'));
app.use(express.static(path.join(__dirname, '../dist')));

// *** config middleware *** //
app.use(require('morgan')('combined', { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// *** main routes *** //
app.use('/', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// *** error handlers *** //

// development and test error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'test') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('index', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('index', {
    message: err.message,
    error: {},
  });
});


module.exports = app;
