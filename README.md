# Transaction Processing Script

This script processes financial transactions, calculates commissions, and maintains weekly quotas for users.

## Overview

The script reads transaction data from a JSON file, processes each transaction, calculates the commission based on transaction type and user type, and logs the commissions. It also manages weekly quotas to track users' free transaction limits.

## Functions

### `main()`

- Entry point of the script.
- Reads transaction data from the input file, processes transactions, and logs commissions.

### `processTransaction(transaction)`

- Processes a single transaction.
- Determines the transaction type and user type.
- Calculates the commission based on the transaction details and updates weekly quotas.

### `deleteQuotasFile()`

- Deletes the `quotas.json` file if it exists.
- Used to reset quotas when running the script.

### `loadQuotas()`

- Loads weekly quotas data from the `quotas.json` file.
- Initializes new quotas if the file doesn't exist or data for the current week is not available.
- Ensures quota values are initialized for all users.

### `saveQuotas()`

- Saves weekly quotas data to the `quotas.json` file.
- Called after updating quotas to persist changes.

### `checkWeeklyPeriod(transactionDate)`

- Checks if the transaction date falls within the current week.
- Updates the weekly start date and resets weekly quotas if necessary.

## Quotas File

The `quotas.json` file is used to store weekly quotas for users. It keeps track of the total amount spent and the free amount used by each user. This file is managed by the script to maintain accurate quota data between script executions.

## Usage

To run the script, provide the input file path as a command-line argument:

```node app.js input.json```

To run the unit tests, use the following command:

```npm test```
