var genericHandler = {};

var ugcSerialNoMgr = require('../ugc_serial_no_mgr.js');
var no = 0;


genericHandler.cbOfGetUgcSerialNo = function(req, res) {
    var ugcSerialNo = ugcSerialNoMgr.getUgcSerialNo();
    
    res.send({ugcSerialNo: ugcSerialNo});
};

module.exports = genericHandler;