const CONSTANTS = require('./constants');

// Returns the type of the transaction.
const getTransactionType = transaction => transaction.type;

// Returns the type of the user associated with the transaction.
const getUserType = transaction => transaction.user_type;

// Calculates the commission for cash-in transactions.
const calculateCashInCommission = amount => {
  const commission = amount * CONSTANTS.CASH_IN_COMMISSION_RATE;
  return Math.min(commission, CONSTANTS.MAX_CASH_IN_COMMISSION);
};

// Calculates the commission for cash-out transactions for natural users.
const calculateCashOutCommissionNatural = (amount, weeklyQuotaUsed) => {
  const freeAmountLeft = CONSTANTS.FREE_WEEKLY_QUOTA - weeklyQuotaUsed;

  if (freeAmountLeft > 0) {
    if (amount <= freeAmountLeft) {
      return 0;
    } else {
      const excessAmount = amount - freeAmountLeft;
      return excessAmount * CONSTANTS.CASH_OUT_NATURAL_COMMISSION_RATE;
    }
  } else {
    return amount * CONSTANTS.CASH_OUT_NATURAL_COMMISSION_RATE;
  }
};

// Calculates the commission for cash-out transactions for juridical users.
const calculateCashOutCommissionJuridical = amount => {
  return Math.max(amount * CONSTANTS.CASH_OUT_NATURAL_COMMISSION_RATE, CONSTANTS.MIN_CASH_OUT_JURIDICAL_COMMISSION);
};

// Rounds up the amount to the nearest cent and ensures it's formatted with two digits after the decimal point.
const roundUpToCent = amount => (Math.ceil(amount * CONSTANTS.CENTS_IN_EUR) / CONSTANTS.CENTS_IN_EUR).toFixed(2);

module.exports = {
  getTransactionType,
  getUserType,
  calculateCashInCommission,
  calculateCashOutCommissionNatural,
  calculateCashOutCommissionJuridical,
  roundUpToCent
};
