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
            addConnection: function(remoteID, type, load){
                //console.log('%s is connected! [type=%s]', remoteID, type);
                connectedRemotes[remoteID] = {type: type, load: load};
            },
            
            removeConnection: function(remoteID){
                //console.log('%s is disconnected!', remoteID);
                delete connectedRemotes[remoteID];
            },
            

            getConnectedRemoteWithLowestLoad: function(type, cbOfGetConnectedRemoteWithLowestLoad){
                for (anId in connectedRemotes){
                    var lowestLoadIndex = 1000000;
                    var connectedRemoteWithLowestLoad = null;
                    //console.log('%s %s', anId, connectedRemotes[anId]);
                    if (type){
                        if (connectedRemotes[anId].type==type){
                            if (connectedRemotes[anId].load < lowestLoadIndex ) {
                                lowestLoadIndex = connectedRemotes[anId].load;
                                connectedRemoteWithLowestLoad = anId;
                            }
                        }                        
                    }
                    else { 
                        cbOfGetConnectedRemoteWithLowestLoad('Parameter "type" is not specified.', null);
                    }
                }
                
                cbOfGetConnectedRemoteWithLowestLoad(null, connectedRemoteWithLowestLoad);
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