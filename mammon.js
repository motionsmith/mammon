var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');
var fs = require('fs');
var promise = require('promise');

var banks = require('./banks');

var url = 'mongodb://localhost:27017/test';

var file = argVal('file');
if (!file) {
  console.log('No file provided.');
  file = process.cwd() + '/transactions.json';
  console.log(file);
} else {
  console.log('loading file ' + file);
}

loadJsonFile(file).then(onFileLoaded, onFileLoadError);

function loadJsonFile(path) {
  return promise.denodeify(fs.readFile)(path, 'utf8');
}

function transformTransactions(transactions) {
  var bank = banks.getBankForTransactionJson(transactions);
  if (bank === null) {
    console.log('This file format is not recognized.');
  }
  bank.transform(transactions);
  return transactions.transactions;
}

function addTransactionsToDb(transactions) {
  MongoClient.connect(url, function(error, db) {
    if (error) {
      console.log('error connecting to db: ' + err);
    } else {
      var bulk = db.collection('transactions').initializeUnorderedBulkOp();
      transactions.forEach(function(transaction) {
        bulk.find({'_id': transaction._id}).upsert().replaceOne(transaction);
      });
      bulk.execute(function(err, result) {
        if (err) {
          console.log('Error with bulk replace: ' + err);
        } else {
          console.log('success! Added ' + result.getRawResponse().nUpserted + ' new transactions and ' + result.getRawResponse().nModified + ' modifications.');
          db.close();
        }
      })
    }
  });
}

function onFileLoaded(result) {
  var obj = JSON.parse(result);
  var transactions = transformTransactions(obj);
  addTransactionsToDb(transactions);
}

function onFileLoadError(error) {
  console.log('File load error: ' + error);
}

function onDbErr(err) {
  console.log('Db err' + error);
}

function argVal(arg) {
  var index = process.argv.indexOf('--' + arg);
  if (index >= 0) {
    return process.argv[index + 1];
  }
  return null;
}