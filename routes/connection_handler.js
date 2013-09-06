var connectionHandler = {};

var events = require("events");
var eventEmitter = new events.EventEmitter();
var globalConnectionMgr;

var requestsToRemote = new Object();

connectionHandler.init = function( _globalConnectionManager ){
    globalConnectionMgr = _globalConnectionManager;
};

connectionHandler.sendRequestToRemote = function( targetID, reqToRemote, cb ) {
    //TODO: make sure reqToRemote is not null
    reqToRemote._commandID = reqToRemote.command + '__' + targetID + '__' + (new Date()).getTime().toString();
    
    if (!requestsToRemote[targetID]){
        requestsToRemote[targetID] = new Array();
    }
    
    requestsToRemote[targetID].push(reqToRemote);
    
    if ( globalConnectionMgr.isConnectedTo(targetID) ){
        eventEmitter.emit('COMMAND_'+targetID, requestsToRemote[targetID].shift());
    }
    
    
    eventEmitter.once('RESPONSE_'+reqToRemote._commandID, cb);
};

//POST /internal/command_responses
connectionHandler.commandResponse_post_cb = function(req, res) {

	var commandID = req.body._command_id;
	var remoteID = req.body._remote_id;
	var responseParameters = req.body;

	eventEmitter.emit('RESPONSE_'+commandID, responseParameters);
	logger.info('Got response ' + commandID + ' from ' + remoteID + ' :' );
	logger.info(JSON.stringify(responseParameters));
	
	res.send(200);
};


//GET /internal/commands
connectionHandler.command_get_cb = function(req, res) {
	logger.info('['+ new Date() +']Got long-polling from remote: '+ req.query.remote_id );
	//console.log('['+ new Date() +']Got long-polling HTTP request from remote: '+ req.query.remote_id )
	//console.dir(req);
	
	
	var messageToRemote = new Object();
	
	var callback = function(reqToRemote){
		//logger.info(reqToRemote);
		clearTimeout(timer);
		messageToRemote.type = "COMMAND";
		messageToRemote.body = reqToRemote;
		res.send(messageToRemote);
		globalConnectionMgr.removeConnection(req.query.remote_id);
	};
	
	globalConnectionMgr.addConnection(req.query.remote_id, req.query.remote_type);

	var timer = setTimeout(function(){ 
		eventEmitter.removeListener('COMMAND_'+req.query.remote_id, callback);
		messageToRemote.type = "LONG_POLLING_TIMEOUT";
		messageToRemote.body = null;
		res.send(messageToRemote);
		globalConnectionMgr.removeConnection(req.query.remote_id);
	}, 60000);	
	//}, 5000);	
	
	eventEmitter.once('COMMAND_'+req.query.remote_id, callback);	
	if ( requestsToRemote[req.query.remote_id] ) {
        if ( requestsToRemote[req.query.remote_id].length > 0 ){
            eventEmitter.emit('COMMAND_'+req.query.remote_id, requestsToRemote[req.query.remote_id].shift());
        }
	}

};

module.exports = connectionHandler;