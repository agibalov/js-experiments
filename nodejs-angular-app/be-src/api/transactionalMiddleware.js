module.exports = function(Sequelize, dataContext) {
  return function* (next) {
    var transaction = yield dataContext.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    this.tx = transaction;

    try {
      yield next;

      try {
        yield transaction.commit();
        console.log('operation succeeded, commit succeeded');
      } catch(commitException) {
        console.log('operation succeeded, commit failed', commitException);
      }
    } catch(operationException) {
      console.log('OperationException', operationException);

      try {
        yield transaction.rollback();
        console.log('operation failed, rollback succeeded');
      } catch(rollbackException) {
        console.log('operation failed, rollback failed', rollbackException);
      }

      throw operationException;
    }
  };
};
