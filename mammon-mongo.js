var MongoClient = require('mongodb').MongoClient;
var Promise = require('promise');

var _host, _port, _db;

exports.configure = function (host, port, db) {
  _host = host; _port = port; _db = db;
}

exports.addTransactions = function (transactions) {
  return new Promise(function (fulfill, reject) {

    Promise.denodeify(MongoClient.connect)('mongodb://' + _host + ':' + _port + '/' + _db)
    .then(function (db) {
      var bulk = db.collection('transactions').initializeUnorderedBulkOp();
      transactions.forEach(function(transaction) {
        bulk.find({'_id': transaction._id}).upsert().replaceOne(transaction);
      });

      //I can't "return Promise.denodeify(bulk.execute)()" because there's a bug in the MongoDB driver.
      bulk.execute(function(error, result) {
        if (error) {
          reject(error);
        } else {
          db.close();
          fulfill(result);
        }
      });
    })
    .catch(function(error) {
      console.log('Problem connecting to db: ' + error);
      reject(error);
    });
  });
}