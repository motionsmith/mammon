
//3rd Party modules
var fs = require('fs');
var promise = require('promise');

//Local modules
var banks = require('./banks');
var mammonMongo = require('./mammon-mongo');
var utils = require('./utils');

mammonMongo.configure('localhost', '27017', 'test');

if (utils.getArgVal('file')) {
  uploadTransactions(utils.getArgVal('file'));
} else if (utils.getArgVal('gtx')) {
  mammonMongo.getTransactions[utils.getArgVal('gtx')]()
  .then(printTransactions)
  .catch(catchError);
} else {
  console.log('No command found.')
}

function loadJsonFile(path) {
  return promise.denodeify(fs.readFile)(path, 'utf8');
}

function addTransactionsToDb(fileContents) {
  var transactions = banks.transformBankData(JSON.parse(fileContents));
  return mammonMongo.addTransactions(transactions);
}

function printTransactions(results) {
  console.log(banks.printTransactions(results));
}

function catchError(error) {
  console.log('Generic error catch: ' + error.stack);
}

function uploadTransactions(fileName) {
  loadJsonFile(fileName)
  .then(addTransactionsToDb)
  .then(function(result) {
    console.log('success! Added ' + result.getRawResponse().nUpserted + ' new transactions and ' + result.getRawResponse().nModified + ' modifications.');
  })
  .catch(catchError);
}