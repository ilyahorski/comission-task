const fs = require('fs');
const moment = require('moment');
const { getTransactionType, getUserType, calculateCashInCommission, calculateCashOutCommissionNatural, calculateCashOutCommissionJuridical, roundUpToCent } = require('./utils');
const CONSTANTS = require('./constants');

const inputFilePath = process.argv[2];
const output = [];
let weeklyStartDate = '';
let currentWeek = '';
let weeklyQuotas = {};

// Checks if the transaction date falls within the current week and updates weekly quotas accordingly.
const checkWeeklyPeriod = (transactionDate) => {
  const transactionWeekStart = moment(transactionDate).startOf('isoWeek');

  if (!weeklyStartDate || transactionWeekStart.isAfter(moment(weeklyStartDate))) {
    weeklyStartDate = transactionWeekStart.format('YYYY-MM-DD');
    currentWeek = weeklyStartDate;

    // Reset weekly quotas for all users
    Object.keys(weeklyQuotas).forEach(userId => {
      weeklyQuotas[userId] = { totalAmount: 0, freeAmountUsed: 0 };
    });

    saveQuotas(); // Save updated quotas
  }
};

// Deletes the quotas.json file if it exists.
const deleteQuotasFile = () => {
  try {
    fs.unlinkSync('quotas.json');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error("Error deleting quotas file:", err);
    }
  }
};

// Loads weekly quotas data from the quotas.json file or initializes new quotas if the file doesn't exist.
const loadQuotas = () => {
  try {
    const data = fs.readFileSync('quotas.json', 'utf8');
    if (data.trim() === '') {
      weeklyQuotas = {};
      saveQuotas();
      return;
    }
    const quotasData = JSON.parse(data);

    // If the data for the current week exists, load it; otherwise, initialize new weekly quotas.
    if (quotasData.currentWeek && quotasData.currentWeek === moment().startOf('isoWeek').format('YYYY-MM-DD')) {
      weeklyStartDate = quotasData.weeklyStartDate;
      currentWeek = quotasData.currentWeek;
      weeklyQuotas = quotasData.quotas;
    } else {
      weeklyStartDate = moment().startOf('isoWeek').format('YYYY-MM-DD');
      currentWeek = weeklyStartDate;
      weeklyQuotas = {};
      saveQuotas();
    }

    // Initialize quota values for all users if not defined
    const userIds = Object.keys(weeklyQuotas);
    const initialQuotaValues = { totalAmount: 0, freeAmountUsed: 0 };
    userIds.forEach(userId => {
      weeklyQuotas[userId] = weeklyQuotas[userId] || initialQuotaValues;
    });
  } catch (err) {
    // Handle file read errors or missing file
    if (err.code === 'ENOENT') {
      weeklyQuotas = {};
      saveQuotas();
    } else {
      console.error("Error reading quotas file:", err);
    }
  }
};

// Saves weekly quotas data to the quotas.json file.
const saveQuotas = () => {
  try {
    const quotasData = {
      weeklyStartDate,
      currentWeek,
      quotas: weeklyQuotas
    };
    fs.writeFileSync('quotas.json', JSON.stringify(quotasData, null, 2));
  } catch (err) {
    console.error("Error saving quotas file:", err);
  }
};

// Processes each transaction, calculates commissions, and updates weekly quotas.
const processTransaction = (transaction) => {
  const transactionType = getTransactionType(transaction);
  const userType = getUserType(transaction);
  const amount = transaction.operation.amount;
  const userId = transaction.user_id;
  let commission;

  checkWeeklyPeriod(transaction.date); // Ensure the weekly period is correct for the transaction date

  if (transactionType === 'cash_in') {
    commission = calculateCashInCommission(amount);
  } else if (userType === 'natural') {
    const userQuotas = weeklyQuotas[userId] || { totalAmount: 0, freeAmountUsed: 0 };
    const freeAmountLeft = CONSTANTS.FREE_WEEKLY_QUOTA - userQuotas.freeAmountUsed;

    if (freeAmountLeft > 0) {
      if (amount <= freeAmountLeft) {
        commission = 0;
        userQuotas.totalAmount += amount;
        userQuotas.freeAmountUsed += amount;
      } else {
        const excessAmount = amount - freeAmountLeft;
        userQuotas.freeAmountUsed = CONSTANTS.FREE_WEEKLY_QUOTA;
        userQuotas.totalAmount += amount;
        commission = calculateCashOutCommissionNatural(excessAmount, userQuotas.freeAmountUsed);
      }
    } else {
      commission = calculateCashOutCommissionNatural(amount, userQuotas.freeAmountUsed);
    }

    weeklyQuotas[userId] = userQuotas;
    saveQuotas();
  } else {
    commission = calculateCashOutCommissionJuridical(amount);
  }

  commission = roundUpToCent(commission);
  output.push(commission);
};

// Main function that reads transaction data, processes transactions, and logs the commissions.
const main = async () => {
  try {
    const data = await fs.promises.readFile(inputFilePath, 'utf8');
    const transactions = JSON.parse(data);

    for (const transaction of transactions) {
      processTransaction(transaction);
    }

    console.log(output.join('\n'));
  } catch (err) {
    console.error("Error reading input file:", err);
  }
};

deleteQuotasFile();
loadQuotas();
main();
