var ugcSerialNoMgr = (function(){
    var uInstance = null;
    
    function constructor(){
        var db = require('./db.js');
        var ugcModel = db.getDocModel("ugc");

        var ugcSerialNo = 0;

        return {
            //-- public services --
            init: function(cbOfInit) {
                
                ugcModel.findOne().sort({no: -1}).exec( function(err, doc) {
                    if (!err) {
                        ugcSerialNo =  doc.no;
                        cbOfInit(null);
                    }
                    else {
                        cbOfInit("Fail to get maximum no of UGC: "+ err);
                    }        
                });
            },

            getUgcSerialNo: function(cbOfGetUgcSerialNo) {
                ugcSerialNo++;
                cbOfGetUgcSerialNo(null, ugcSerialNo);
            }
        };
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






module.exports = ugcSerialNoMgr.getInstance();