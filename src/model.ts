export interface Statement {
  date: Date;
  description: string;
  amount: number;
  instalments?: string;
}

export interface InvoiceOutput {
  invoiceDate: string;
  invoiceAmount: number;
  lastInvoiceAmount: number;
  donePaymentsAmount: number;
  statements: Statement[];
}
