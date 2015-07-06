module.exports = {
  name: "simple",
  transformTx: function(tx) {
    tx._id = tx.uuid;
  },
  getTransactions: function(serializedFile) {
    if (!serializedFile ||
        !serializedFile.transactions) {
      return null;
    }

    return serializedFile.transactions;
  }
};