var utils = require('./utils');

exports.banks = {
  simple: require('./banks/bank_simple')
};

exports.transformBankData = function(serializedFile) {
  var bank;
  //Check if it's a serialized transaction file.
  for (bank in exports.banks) {
    if (exports.banks.hasOwnProperty(bank)) {
      if (exports.banks[bank].getTransactions(serializedFile)) {
        bank = exports.banks[bank];
      }
    }
  }

  if (!bank) {
    throw new Error("Cannot find a bank that can parse this object.");
  }

  var txs = bank.getTransactions(serializedFile);
  if (!txs) {
    console.log('This is not recognized as a ' + bank.name + ' bank file.');
  }

  txs.forEach(function (tx) {
    tx.bank = bank.name;
    bank.transformTx(tx);
  });

  return txs;
};

exports.printTransactions = function(txs) {
  if (!txs) {
    return '';
  }

  //If the input is not an array, convert it to one so that all inputs can be handled uniformily.
  if (!Array.isArray(txs)) {
    txs = [txs];
  }

  var bank = exports.banks[txs[0].bank];
  if (!bank) {
    bank = exports.getBankFromData(txs);
  }

  var output = [];
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    output[i] = '[' + i + '] ' + tx.description + ' ' + tx.bookkeeping_type + ' ' + tx.amounts.amount;
  }

  return output.join('\n');
};