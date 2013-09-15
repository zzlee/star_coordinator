
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var winston = require('winston');
var async = require('async');
var globalConnectionMgr = require('./global_connection_mgr.js');
var ugcSerialNoMgr = require('./ugc_serial_no_mgr.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));  //This line outputs the HTTP connection traces
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
global.logger = logger; 


async.waterfall([
    function(callback){
        //Initialize ugcSerialNoMgr
        ugcSerialNoMgr.init(function(err) {
            if (!err){
                callback(null);
            }
            else {
                callback("Failed to initialize ugcSerialNoMgr: "+err);
            }
        });
    },
    function(callback){
        //Defiene the RESTful APIs
        
        
        app.get('/', routes.index);
              
        //Internal
        app.get('/internal/commands', routes.connectionHandler.command_get_cb);
        app.post('/internal/command_responses', routes.connectionHandler.commandResponse_post_cb); 
        
        //GET /internal/connected_remotes
        app.get('/internal/connected_remote_with_lowest_load', routes.connectionHandler.cbOfGetConnectedRemoteWithLowestLoad);
        
        //POST /internal/requests_to_remote
        app.post('/internal/requests_to_remote', routes.connectionHandler.cbOfPostRequestsToRemote);
        
        //GET /internal/ugc_serial_no
        app.get('/internal/ugc_serial_no', routes.genericHandler.cbOfGetUgcSerialNo);
        
        http.createServer(app).listen(app.get('port'), function(){
            //console.log('Express server listening on port ' + app.get('port'));
            //logger.info('star_coordinator started');
            callback(null);
        });
    },
    function(callback){
        //test
//        setInterval(function(){
//            ugcSerialNoMgr.getUgcSerialNo(function(err, ugcSerialNo){
//                console.log('no='+ugcSerialNo);
//            });
//        }, 4000);
        
//        var globalConnectionMgr = require('./global_connection_mgr.js');
//        setInterval(function(){
//            var commandParameters = {
//                para1: "hello_from_star_coordinator",
//                paraTest2: "test"
//            };
//                        
//            globalConnectionMgr.sendRequestToRemote( "story_cam_server_Gance_PC", { command: "CONNECTION_TEST", parameters: commandParameters }, function(responseParameters) {
//                console.log('responseParameters=');
//                console.dir(responseParameters);
//            });
//            globalConnectionMgr.sendRequestToRemote( "AE_Server_Gance_PC", { command: "CONNECTION_TEST", parameters: commandParameters }, function(responseParameters) {
//                console.log('responseParameters=');
//                console.dir(responseParameters);
//            });
//        }, 4000);
        
        callback(null);
    }
], function (err) {
    if (err){
        console.log('app.js initializes with errors: '+err);
    }
});






