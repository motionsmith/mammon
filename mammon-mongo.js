var MongoClient = require('mongodb').MongoClient;
var Promise = require('promise');

//Connection settings
var url;

var connect = Promise.denodeify(MongoClient.connect);

exports.configure = function (host, port, db) {
  url = 'mongodb://' + host + ':' + port + '/' + db;
};

exports.addTransactions = function (transactions) {
  return new Promise(function (fulfill, reject) {

    connect(url)
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
    .catch(reject);
  });
};

exports.getTransactions = {
  sinceLastPaycheck: function() {
    return new Promise(function (fulfill, reject){
      connect(url)
      .then(function (db) {
        var cursor = db.collection('transactions').find({
          "categories": {
            $elemMatch: {
              "uuid": "221"
            }
          }
        })
        .sort({
          "times.when_recorded": -1
        })
        .limit(1)
        .toArray(function (error, result) {
          if (error) {
            reject(error);
          } else {
            db.close();
            fulfill(result);
          }
        });

        //I can't "return Promise.denodeify(cursor.toArray)().then(fulfill);" because there's a bug in the MongoDB driver.
      }).catch(reject);
    });
  }
}

