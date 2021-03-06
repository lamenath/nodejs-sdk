
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    prismic = require('./prismic-helpers');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon("public/images/punch.png"));
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

// Routes
app.route('/').get(function(req, res){
  res.render('index');
});

app.route('/preview').get(function(req, res) {
  prismic.withContext(req,res, function then(ctx){
    var token = req.query['token'];

    if (token) {
      ctx.api.previewSession(token, ctx.linkResolver, '/', function(err, url) {
        res.cookie(prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
        res.redirect(301, url);
      });
    } else {
      res.send(400, "Missing token from querystring");
    }
  });
});

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
