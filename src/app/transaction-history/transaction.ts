export interface Record {
  categoryCode: string;
  dates: Dates;
  transaction: Transaction;
  merchant: Merchant;
}

export interface Dates {
  valueDate: number;
}
export interface Transaction {
  amountCurrency: AmountCurrency;
  type: string;
  creditDebitIndicator: string;
}

export interface AmountCurrency {
  amount: number;
  currencyCode: string;
}

export interface Merchant {
  name: string;
  accountNumber: string;
}
