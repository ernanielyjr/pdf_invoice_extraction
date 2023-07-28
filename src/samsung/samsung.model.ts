export interface ItemBase {
  text?: string;
}
export interface RawStatement {
  date?: string;
  description?: string;
  amount?: string;
  instalments?: string;
}

export interface SumStatements {
  itemsSum: number;
  reversedItemsSum: number;
}
