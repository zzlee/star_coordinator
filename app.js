
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var winston = require('winston');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var workingPath = process.cwd();
var logDir = path.join(workingPath,'log');
if (!fs.existsSync(logDir) ){
    fs.mkdirSync(logDir);
}
var logger = new(winston.Logger)({
    transports: [ 
        new winston.transports.File({ filename: './log/winston.log'})   
    ],
    exceptionHandlers: [new winston.transports.File({filename: './log/exceptions.log'})]    
});  


app.get('/', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//Internal
app.get('/internal/commands', routes.connectionHandler.command_get_cb);
app.post('/internal/command_responses', routes.connectionHandler.commandResponse_post_cb); 
