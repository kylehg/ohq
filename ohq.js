/**
 * A simple queue app for TA office hours.
 * @author kyle@kylehardgrave.com (Kyle Hardgrave)
 */
var express = require('express'),
  app = express.createServer(),
  io = require('socket.io').listen(app),
  hbs = require('hbs'),
  _ = require('underscore'),
  fs = require('fs');


// Main Config
// -----------
app.configure(function(){
  app.enable('templateDir');
  app.set('templateDir', '/templates');

  app.enable('staticDir');
  app.set('staticDir', '/static');

  app.enable('frontend_templates');
  app.set('frontend_templates', ['queue', 'queue_item']);

  app.set('view engine', 'hbs');
  // app.register('.html', hbs); // Allows using .html

  // Global Config
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);

  // Dev Config (TODO: Put these in a separate app.config)
  app.use('/static', express.static(__dirname + app.settings['staticDir']));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('views', __dirname + app.settings['templateDir']);
});


// Main Routers
// ------------

// Add necessary headers
app.get('/*', function(req, res, next) {
  res.header('X-UA-Compatible', 'IE=edge,chrome=1');

  // Continue  to the next matching method
  next();
});

// Render and serve the main page
app.get('/', function(req, res) {
  res.render('index.hbs', {
    layout: false, // Necessary to send whole page
    staticDir: app.settings['staticDir'],

    // Read and send along the templates
    templates: _.map(app.settings['frontend_templates'], function(tplName) {
      return {
        template_name: tplName,
        template: '' + fs.readFileSync(__dirname + 
            app.settings['templateDir'] + '/' + tplName + '.hbs')
      };
    })

  });
});

// io.sockets.on('connection', function(socket) {
//   console.log('New socket connected.');
//   io.sockets.emit('message', { body: 'Someone joined!' });
  
//   socket.   on('submit', function(nameObj) {
//     var name = nameObj.name;
//     console.log('Received enqueue request for ' + name);
//     io.sockets.emit('enqueue', { name: name });
//   });
// });


// Leggo
// -----
app.listen(8080);
