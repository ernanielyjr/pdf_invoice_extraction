export interface Statement {
  type: "CREDIT" | "DEBIT";
  date: Date;
  amount: number;
  description: string;
  totalInstalments?: number;
  currentInstalment?: number;
}

export enum V5_TYPES {
  INVOICE_ID = "59baeb02-42db-4d2a-9c6b-86ec9fd728a6",
  STATEMENT_ID = "c0b9d940-9f1e-11eb-8dcd-0242ac130004",
}
