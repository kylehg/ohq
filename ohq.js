var express = require('express');
var jade = require('jade');

var app = express.createServer(express.logger());


/* Config */
app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);

  app.set('views', __dirname + '/views');
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// App
app.get('/', function(req, res) {
  res.render('index.jade', {
    pageTitle: 'Office Hours Queue',
    youAreUsingJade: req.param('jade', '0') == '1'
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});