const {
  roundUpToCeil,
  calculateFeePercentage,
  calculateCashInFee,
  calculateCashOutNaturalFee,
  calculateCashOutJuridicalFee,
  calculateWeeklyAmount,
  calculateCommissions,
} = require('./utils');

describe('roundUpToCeil', () => {
  it('should round up 0.023 to 0.03', () => {
    expect(roundUpToCeil(0.023)).toBe(0.03);
  });
});

describe('calculateFeePercentage', () => {
  it('should calculate 0.03% of 1000 as 0.3', () => {
    expect(calculateFeePercentage(1000, 0.03)).toBe(0.3);
  });
  it('should calculate 0.3% of 30000 as 90', () => {
    expect(calculateFeePercentage(30000, 0.3)).toBe(90);
  });
  it('should return 0 when amount is 0', () => {
    expect(calculateFeePercentage(0, 10)).toBe(0);
  });
  it('should return 0 when percentage is 0', () => {
    expect(calculateFeePercentage(1000, 0)).toBe(0);
  });
});

describe('calculateCashInFee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should calculate fee as 0.03% of the amount and round up if it is less than the maximum fee', () => {
    expect(calculateCashInFee(1000)).toBe(0.3);
  });
  it('should apply the maximum fee if the calculated fee exceeds the max limit', () => {
    expect(calculateCashInFee(100000)).toBe(5);
  });
  it('should calculate a very small fee and round up to the nearest cent', () => {
    expect(calculateCashInFee(7.67)).toBe(0.01);
  });
});

describe('calculateCashOutNaturalFee', () => {
  it('should calculate 0 fee when the weekly total is below the limit', () => {
    expect(calculateCashOutNaturalFee(500, 500)).toBe(0);
  });
  it('should calculate the fee only on the amount exceeding the weekly limit', () => {
    expect(calculateCashOutNaturalFee(500, 800)).toBe(0.9);
  });
  it('should calculate the fee for the entire amount if weekly total is already above the limit', () => {
    expect(calculateCashOutNaturalFee(500, 1500)).toBe(1.5);
  });
  it('should calculate a fee and round it up correctly when the fee is a small value', () => {
    expect(calculateCashOutNaturalFee(7.67, 1200)).toBe(0.03);
  });
});

describe('calculateCashOutJuridicalFee', () => {
  it('should calculate the correct fee when the calculated fee is above the minimum fee', () => {
    expect(calculateCashOutJuridicalFee(500)).toBe(1.5);
  });

  it('should apply the minimum fee when the calculated fee is below the minimum fee', () => {
    expect(calculateCashOutJuridicalFee(50)).toBe(0.5);
  });

  it('should correctly round up the calculated fee', () => {
    expect(calculateCashOutJuridicalFee(200)).toBe(0.6);
  });

  it('should handle a large amount where fee is well above the minimum fee', () => {
    expect(calculateCashOutJuridicalFee(100000)).toBe(300);
  });
});

describe('calculateWeeklyAmount', () => {
  it('should return 0 if the user has no previous transactions', () => {
    const transactions = {};
    const result = calculateWeeklyAmount(transactions, 1, '2024-08-28');
    expect(result).toBe(0);
  });

  it('should return 0 if there are no cash out transactions in the past week', () => {
    const transactions = {
      1: [
        {
          date: '2024-08-01',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_in',
          operation: { amount: 200.00, currency: 'EUR' },
        },
      ],
    };
    const result = calculateWeeklyAmount(transactions, 1, '2024-08-28');
    expect(result).toBe(0);
  });

  it('should calculate the sum of cash out transactions for the past week', () => {
    const transactions = {
      1: [
        {
          date: '2024-08-25',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_out',
          operation: { amount: 200.00, currency: 'EUR' },
        },
        {
          date: '2024-08-26',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_out',
          operation: { amount: 300.00, currency: 'EUR' },
        },
      ],
    };
    const result = calculateWeeklyAmount(transactions, 1, '2024-08-28');
    expect(result).toBe(500);
  });

  it('should ignore cash out transactions outside the past week', () => {
    const transactions = {
      1: [
        {
          date: '2024-08-15',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_out',
          operation: { amount: 400.00, currency: 'EUR' },
        },
        {
          date: '2024-08-27',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_out',
          operation: { amount: 100.00, currency: 'EUR' },
        },
      ],
    };
    const result = calculateWeeklyAmount(transactions, 1, '2024-08-28');
    expect(result).toBe(100);
  });
});

describe('calculateCommissions', () => {
  it('should calculate all commitions according to expected results', () => {
    const operations = [
      {
        date: '2016-01-05',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_in',
        operation: { amount: 200.00, currency: 'EUR' },
      },
      {
        date: '2016-01-06',
        user_id: 2,
        user_type: 'juridical',
        type: 'cash_out',
        operation: { amount: 300.00, currency: 'EUR' },
      },
      {
        date: '2016-01-06',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 30000, currency: 'EUR' },
      },
      {
        date: '2016-01-07',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 1000.00, currency: 'EUR' },
      },
      {
        date: '2016-01-07',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 100.00, currency: 'EUR' },
      },
      {
        date: '2016-01-10',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 100.00, currency: 'EUR' },
      },
      {
        date: '2016-01-10',
        user_id: 2,
        user_type: 'juridical',
        type: 'cash_in',
        operation: { amount: 1000000.00, currency: 'EUR' },
      },
      {
        date: '2016-01-10',
        user_id: 3,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 1000.00, currency: 'EUR' },
      },
      {
        date: '2016-02-15',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 300.00, currency: 'EUR' },
      },
    ];
    const expectedCommitions = ['0.06', '0.90', '87.00', '3.00', '0.30', '0.30', '5.00', '0.00', '0.00'];
    expect(calculateCommissions(operations)).toStrictEqual(expectedCommitions);
  });
});
