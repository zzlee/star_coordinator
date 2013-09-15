var ugcSerialNoMgr = {}; 

var db = require('./db.js');
var ugcModel = db.getDocModel("ugc");


var ugcSerialNo = 0;

ugcSerialNoMgr.init = function(cbOfInit) {
    
    ugcModel.findOne().sort({no: -1}).exec( function(err, doc) {
        if (!err) {
            ugcSerialNo =  doc.no;
            cbOfInit(null);
        }
        else {
            cbOfInit("Fail to get maximum no of UGC: "+ err);
        }        
    });
};


ugcSerialNoMgr.getUgcSerialNo = function() {
    ugcSerialNo++;
    return ugcSerialNo;
};

//ugcSerialNoMgr.init();


module.exports = ugcSerialNoMgr;