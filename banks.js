exports.banks = {
  simple: require('./banks/bank_simple')
};

exports.getBankForTransactionJson = function(obj) {
  for (bank in exports.banks) {
    if (exports.banks.hasOwnProperty(bank) && exports.banks[bank].recognize(obj)) {
      return exports.banks[bank];
    }
  }
  return null;
};