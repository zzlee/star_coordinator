var genericHandler = {};

var ugcSerialNoMgr = require('../ugc_serial_no_mgr.js');

genericHandler.cbOfGetUgcSerialNo = function(req, res) {
	logger.info('[GET '+req.path+'] is called');
    var ugcSerialNo = ugcSerialNoMgr.getUgcSerialNo(function(err, ugcSerialNo){
    	logger.info('[GET '+req.path+'] ugcSerialNo='+ugcSerialNo);
    	res.send({ugcSerialNo: ugcSerialNo});
    });
};

module.exports = genericHandler;