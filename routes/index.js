
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

var connectionHandler = require('./connection_handler.js');
exports.connectionHandler = connectionHandler;

