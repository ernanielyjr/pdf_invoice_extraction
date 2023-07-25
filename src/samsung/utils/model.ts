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
  date?: Date;
  description?: string;
  amount?: number;
  instalments?: string;
}
