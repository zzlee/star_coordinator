var connectionHandler = {};

var events = require("events");
var eventEmitter = new events.EventEmitter();
var globalConnectionMgr;
var smsMgr = require("../sms_mgr.js");

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
        
    logger.info('Send command ' + reqToRemote._commandID + ' to ' + targetID + ' :' );
    logger.info(JSON.stringify(reqToRemote));
    logger.info('Registered the respondse ' + 'RESPONSE_'+reqToRemote._commandID );
};

//POST /internal/command_responses
connectionHandler.commandResponse_post_cb = function(req, res) {

	var commandID = req.body._commandId;
	var remoteID = req.body._remoteId;
	var responseParameters = req.body;

	eventEmitter.emit('RESPONSE_'+commandID, responseParameters);
	logger.info('Got response of ' + commandID + ' from ' + remoteID + ' :' );
	logger.info(JSON.stringify(responseParameters));
	
	res.send(200);
};


//GET /internal/commands
connectionHandler.command_get_cb = function(req, res) {
	logger.info('['+ new Date() +']Got long-polling from remote: '+ req.query.remoteId );
	//console.log('['+ new Date() +']Got long-polling HTTP request from remote: '+ req.query.remoteId )
	//console.dir(req);
	
	req.connection.setTimeout(60*60*1000);
	
	var messageToRemote = new Object();
	
	var callback = function(reqToRemote){
		//logger.info(reqToRemote);
		clearTimeout(timer);
		messageToRemote.type = "COMMAND";
		messageToRemote.body = reqToRemote;
		res.send(messageToRemote);
		globalConnectionMgr.removeConnection(req.query.remoteId);
	};
	
	globalConnectionMgr.addConnection(req.query.remoteId, req.query.remoteType, req.query.remoteLoad);

	var timer = setTimeout(function(){ 
		eventEmitter.removeListener('COMMAND_'+req.query.remoteId, callback);
		messageToRemote.type = "LONG_POLLING_TIMEOUT";
		messageToRemote.body = null;
		res.send(messageToRemote);
		globalConnectionMgr.removeConnection(req.query.remoteId);
	}, 60000);	
	//}, 5000);	
	
	eventEmitter.once('COMMAND_'+req.query.remoteId, callback);	
	if ( requestsToRemote[req.query.remoteId] ) {
        if ( requestsToRemote[req.query.remoteId].length > 0 ){
            eventEmitter.emit('COMMAND_'+req.query.remoteId, requestsToRemote[req.query.remoteId].shift());
        }
	}

};

//GET /internal/connected_remote_with_lowest_load
connectionHandler.cbOfGetConnectedRemoteWithLowestLoad = function(req, res) {
    if (req.query.type) {
        var connectedRemotes = globalConnectionMgr.getConnectedRemoteWithLowestLoad(req.query.type, function(err, result){
            if (!err){
                res.send(200, {connectedRemoteWithLowestLoad: result});
            }
            else {
                res.send(500, {error: "Failed to get the connected remote with the lowest load: "+err});
            }
        });
    }
    else {
        res.send(400, "Parameters are incorrect or wrong.");
    }
    
};

//POST /internal/requests_to_remote
connectionHandler.cbOfPostRequestsToRemote = function(req, res) {

    req.connection.setTimeout(60*60*1000);
    
    if (req.body.targetedRemoteID && req.body.reqToRemote ) {
        globalConnectionMgr.sendRequestToRemote(req.body.targetedRemoteID, req.body.reqToRemote, function(responseParameters){
            res.send(200, {responseParameters: responseParameters});
        });
    }
    else {
        res.send(400, "Parameters are incorrect or wrong.");
    }
};

//POST /internal/send_message_to_mobile_by_remote
connectionHandler.cbOfPostSendMessageToMobileByRemote = function(req, res) {
	logger.info('Send code ' + req.body.code + ' to ' + req.body.phoneNum + 'start');
    if (req.body.phoneNum && req.body.code ) {
        smsMgr.sendMessageToMobile(req.body.phoneNum, req.body.code, function(err, result){
            if (err){
			    logger.info('Send code ' + req.body.code + ' to ' + req.body.phoneNum + ' err:'+ err);
                res.send(401, {message:"手機認證碼發送失敗"});
            }
            else{
				logger.info('Send code ' + req.body.code + ' to ' + req.body.phoneNum + ' result:'+ result);
                res.send(200, {message:"手機認證碼已發送"});
            }
        });
    }
    else {
        res.send(400, "Parameters are incorrect or wrong.");
    }
};

module.exports = connectionHandler;