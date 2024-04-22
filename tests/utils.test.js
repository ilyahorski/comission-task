const {
  getTransactionType,
  getUserType,
  calculateCashInCommission,
  calculateCashOutCommissionNatural,
  calculateCashOutCommissionJuridical,
  roundUpToCent
} = require('../utils');

const CONSTANTS = require('../constants');

describe('getTransactionType', () => {
  it('should return the correct transaction type', () => {
    const transaction = { type: 'cash_in' };
    expect(getTransactionType(transaction)).toBe('cash_in');
  });
});

describe('getUserType', () => {
  it('should return the correct user type', () => {
    const transaction = { user_type: 'natural' };
    expect(getUserType(transaction)).toBe('natural');
  });
});

describe('calculateCashInCommission', () => {
  it('should calculate cash-in commission correctly', () => {
    const amount = 100;
    expect(calculateCashInCommission(amount)).toBe(0.03);
  });

  it('should cap cash-in commission to maximum value', () => {
    const amount = 100000;
    expect(calculateCashInCommission(amount)).toBe(CONSTANTS.MAX_CASH_IN_COMMISSION);
  });
});

describe('calculateCashOutCommissionNatural', () => {
  const weeklyQuota = CONSTANTS.FREE_WEEKLY_QUOTA;

  it('should calculate cash-out commission for natural users correctly when no quota is used', () => {
    const amount = 100;
    const weeklyQuotaUsed = 0;
    expect(calculateCashOutCommissionNatural(amount, weeklyQuotaUsed)).toBe(0);
  });

  it('should calculate cash-out commission for natural users correctly when amount does not exceed quota', () => {
    const amount = 500;
    const weeklyQuotaUsed = 500;
    expect(calculateCashOutCommissionNatural(amount, weeklyQuotaUsed)).toBe(0);
  });

  it('should calculate cash-out commission for natural users correctly when amount exceeds remaining quota', () => {
    const amount = 1500;
    const weeklyQuotaUsed = 500;
    expect(calculateCashOutCommissionNatural(amount, weeklyQuotaUsed)).toBe(3);
  });

  it('should calculate cash-out commission for natural users correctly when amount equals remaining quota', () => {
    const amount = 1000;
    const weeklyQuotaUsed = 0;
    expect(calculateCashOutCommissionNatural(amount, weeklyQuotaUsed)).toBe(0);
  });

  it('should calculate cash-out commission for natural users correctly when amount exceeds total quota', () => {
    const amount = 2000;
    const weeklyQuotaUsed = 1000;
    expect(calculateCashOutCommissionNatural(amount, weeklyQuotaUsed)).toBe(6);
  });
});


describe('calculateCashOutCommissionJuridical', () => {
  it('should calculate cash-out commission for juridical users correctly', () => {
    const amount = 1000;
    expect(calculateCashOutCommissionJuridical(amount)).toBe(3);
  });

  it('should cap cash-out commission to minimum value', () => {
    const amount = 100;
    expect(calculateCashOutCommissionJuridical(amount)).toBe(CONSTANTS.MIN_CASH_OUT_JURIDICAL_COMMISSION);
  });
});

describe('roundUpToCent', () => {
  it('should round up the amount to the nearest cent with two decimal places', () => {
    const amount = 15.555;
    expect(roundUpToCent(amount)).toBe('15.56');
  });

  it('should round up correctly for different amounts', () => {
    const amount = 5.001;
    expect(roundUpToCent(amount)).toBe('5.01'); 
  });
});

