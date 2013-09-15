var genericHandler = {};

var ugcSerialNoMgr = require('../ugc_serial_no_mgr.js');

genericHandler.cbOfGetUgcSerialNo = function(req, res) {
    var ugcSerialNo = ugcSerialNoMgr.getUgcSerialNo(function(err, ugcSerialNo){
        res.send({ugcSerialNo: ugcSerialNo});
    });
};

module.exports = genericHandler;