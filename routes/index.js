
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


exports.connectionHandler = require('./connection_handler.js');
exports.genericHandler = require('./generic_handler.js');
