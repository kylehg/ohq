/**
 * A simple queue app for TA office hours.
 * @author kyle@kylehardgrave.com (Kyle Hardgrave)
 */
var express = require('express'),
  io = require('socket.io'),
  hbs = require('hbs');

var app = express.createServer(express.logger());
io = io.listen(app);


/*
 * Config
 */
app.configure(function(){
  app.enable('templateDir');
  app.set('templateDir', '/templates');

  app.enable('staticDir');
  app.enable('staticDir', '/static');

  app.set('view engine', 'hbs');
  // app.register('.html', hbs); // Allows using .html

  // Global Config
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);

  // Dev Config (TODO: Put these in a separate app.config)
  app.use(express.static(__dirname + app.settings['staticDir']));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('views', __dirname + app.settings['templateDir']);
});


/*
 * Main Functionality
 */
app.get('/', function(req, res) {
  res.render('index.hbs', {
    pageTitle: 'Office Hours Queue',
    staticDir: app.settings['staticDir'],
    youAreUsingJade: req.param('jade', '0') == '1',
    layout: false
  });
});

io.sockets.on('enqueue', function(name) {
  io.sockets.emit('newEnqueue', { name: name });
  console.log('Received enqueue request for ' + name);
});


/*
 * Listen Up
 */
app.listen(5000);