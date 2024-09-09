# PS_test_task

## Overview
This system calculates commission fees for cash-in and cash-out operations based on user type (natural or juridical) and operation type (cash in or cash out). The commission fees adhere to the rules specified by PS, and the system processes input data from a JSON file that contains a series of financial transactions.

### Input Format

The system accepts a JSON file containing a list of transactions. Each transaction has the following structure:
```
{
  "date": "YYYY-MM-DD",
  "user_id": <user_id>,
  "user_type": "natural" | "juridical",
  "type": "cash_in" | "cash_out",
  "operation": {
    "amount": <amount>,
    "currency": "EUR"
  }
}
```

### Development Setup
Install dependencies: `npm install`

The system includes Jest tests to ensure the correctness of each key function. To run the tests: `npm test`

### Running the Application

To calculate commission fees for a list of transactions, run the following command:

`node app.js input.json`

This system ensures accurate commission fee calculation according to the rules provided by PS, handling multiple types of users and operations. With well-defined utility functions and comprehensive tests, it provides a robust solution for handling commission-based financial transactions.


