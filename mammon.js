
//3rd Party modules
var fs = require('fs');
var promise = require('promise');

//Local modules
var banks = require('./banks');
var mammonMongo = require('./mammon-mongo');
var utils = require('./utils');

mammonMongo.configure('localhost', '27017', 'test');

var file = utils.getArgVal('file');
if (!file) {
  console.log('No file provided.');
  file = process.cwd() + '/transactions.json';
  console.log(file);
} else {
  console.log('loading file ' + file);
}

loadJsonFile(file)
.then(addTransactionsToDb)
.then(function(result) {
  console.log('success! Added ' + result.getRawResponse().nUpserted + ' new transactions and ' + result.getRawResponse().nModified + ' modifications.');
})
.catch(catchError);

function loadJsonFile(path) {
  return promise.denodeify(fs.readFile)(path, 'utf8');
}

function addTransactionsToDb(fileContents) {
  var transactions = transformTransactions(JSON.parse(fileContents));
  return mammonMongo.addTransactions(transactions);
}

function transformTransactions(transactions) {
  var bank = banks.getBankForTransactionJson(transactions);
  if (bank === null) {
    console.log('This file format is not recognized.');
  }
  bank.transform(transactions);
  return transactions.transactions;
}

function catchError(error) {
  console.log('Generic error catch: ' + error);
}