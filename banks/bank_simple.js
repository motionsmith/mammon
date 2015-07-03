module.exports = {
  name: "simple",
  transform: function(obj) {
    if (!this.recognize(obj)) {
      console.log('This is not recognized as a Simple bank transaction set.');
    }
    obj.transactions.forEach(function(transaction) {
      transaction._id = transaction.uuid;
    });
  },
  recognize: function(obj) {
    return obj.offset != undefined;
  },
  transaction: {
    id: 'uuid',
    amount: 'amounts.amount',
    type: 'bookkeeping_type',
    description: 'description',
    dateRecorded: 'times.when_recorded',
    memo: 'memo',
    labels: 'labels',
    categories: 'categories'
  }
};