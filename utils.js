/* eslint-disable camelcase */
const {
  CASH_IN,
  CASH_OUT_NATURAL,
  CASH_OUT_JURIDICAL,
} = require('./config');
const {
  OPERATION_TYPES,
  USER_TYPES,
} = require('./constants');

const roundUpToCeil = (amount) => Math.ceil(amount * 100) / 100;

const calculateFeePercentage = (amount, percentage) => (amount * percentage) / 100;

const calculateCashInFee = (amount) => {
  const fee = calculateFeePercentage(amount, CASH_IN.percents);
  return roundUpToCeil(Math.min(fee, CASH_IN.max.amount));
};

const calculateCashOutNaturalFee = (amount, weeklyTotal) => {
  let fee;
  if (weeklyTotal <= CASH_OUT_NATURAL.week_limit.amount) {
    const excessAmount = Math.max(
      0,
      weeklyTotal + amount - CASH_OUT_NATURAL.week_limit.amount,
    );
    fee = calculateFeePercentage(excessAmount, CASH_OUT_NATURAL.percents);
  } else {
    fee = calculateFeePercentage(amount, CASH_OUT_NATURAL.percents);
  }
  return roundUpToCeil(fee);
};

const calculateCashOutJuridicalFee = (amount) => {
  const fee = calculateFeePercentage(amount, CASH_OUT_JURIDICAL.percents);
  return roundUpToCeil(Math.max(fee, CASH_OUT_JURIDICAL.min.amount));
};

const calculateWeeklyAmount = (transactions, user_id, date) => {
  let weaklyAmount = 0;
  const previousTransactionsByUser = transactions[user_id];
  if (!previousTransactionsByUser) {
    return weaklyAmount;
  }
  const operationDate = new Date(date);
  const previousWeekDate = operationDate.setDate(operationDate.getDate() - 7);
  const previousWeekTransactions = previousTransactionsByUser.filter(
    (transaction) => new Date(transaction.date).getTime() > previousWeekDate
      && transaction.type === OPERATION_TYPES.CASH_OUT
      && transaction.user_type === USER_TYPES.NATURAL,
  );
  weaklyAmount = previousWeekTransactions.reduce(
    (acc, transaction) => acc + transaction.operation.amount,
    0,
  );
  return weaklyAmount;
};

const calculateCommissions = (operations) => {
  const transactions = {};
  return operations.map((operation) => {
    const {
      date,
      user_id,
      user_type,
      type,
      operation: {
        amount,
      },
    } = operation;

    let commission = 0;
    switch (type) {
      case OPERATION_TYPES.CASH_IN: {
        commission = calculateCashInFee(amount);
        break;
      }
      case OPERATION_TYPES.CASH_OUT: {
        if (user_type === USER_TYPES.NATURAL) {
          const weaklyTotal = calculateWeeklyAmount(transactions, user_id, date);
          commission = calculateCashOutNaturalFee(amount, weaklyTotal);
        }
        if (user_type === USER_TYPES.JURIDICAL) {
          commission = calculateCashOutJuridicalFee(amount);
        }
        break;
      }
      default: break;
    }

    if (!transactions[user_id]) {
      transactions[user_id] = [];
    }
    transactions[user_id].push(operation);

    return commission.toFixed(2);
  });
};

module.exports = {
  roundUpToCeil,
  calculateFeePercentage,
  calculateCashInFee,
  calculateCashOutNaturalFee,
  calculateCashOutJuridicalFee,
  calculateWeeklyAmount,
  calculateCommissions,
};
