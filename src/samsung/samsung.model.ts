export interface ItemBase {
  text?: string;
}
export interface PreFormattedItem {
  date?: string;
  description?: string;
  amount?: string;
  instalments?: string;
}

export interface FormattedItem {
  date: Date;
  description: string;
  amount: number;
  instalments?: string;
}

export interface SumStatements {
  itemsSum: number;
  reversedItemsSum: number;
}

export interface InvoiceOutput {
  invoiceDate: string;
  invoiceAmount: number;
  lastInvoiceAmount: number;
  donePaymentsAmount: number;
  statements: FormattedItem[];
}
