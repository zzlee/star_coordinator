var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;
    
var connectionHandler = require('./routes/connection_handler.js');

FM.globalConnectionMgr = (function(){
    var uInstance = null;
    var connectedRemotes = new Object();  //set connectedRemotes as a hash table of all connections
    
    function constructor(){
        //the methods exposed to public
        var _this = {
            addConnection: function(remoteID, type){
                //console.log('%s is connected! [type=%s]', remoteID, type);
                connectedRemotes[remoteID] = type;
            },
            
            removeConnection: function(remoteID){
                //console.log('%s is disconnected!', remoteID);
                delete connectedRemotes[remoteID];
            },
            
            getConnectedRemotes: function(type){
                var result = new Array();
                //console.log('total connections');
                
                for (anId in connectedRemotes){
                    //console.log('%s %s', anId, connectedRemotes[anId]);
                    if (type){
                        if (connectedRemotes[anId]==type){
                            result.push(anId);
                        }                        
                    }
                    else { //push all the items in connectedRemotes
                        result.push(anId);
                    }
                }
                
                return result;
            },
            
            isConnectedTo: function(remoteID){
                if (  connectedRemotes[remoteID] ){
                    return true;
                }
                else{
                    return false;
                }
            },
            
            sendRequestToRemote: function( targetedRemoteID, reqToRemote, cb ) {
                connectionHandler.sendRequestToRemote( targetedRemoteID, reqToRemote, cb );
            }
            
                
        };
        
        connectionHandler.init(_this);
        
        return _this;
    }
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            
            return uInstance;
        }
    };
})();

/* TEST */
//FM.globalConnectionMgr.getInstance()._test();

module.exports = FM.globalConnectionMgr.getInstance();