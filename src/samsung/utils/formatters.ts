import { ItemBase } from "./model.js";
import { isAmount, isDate, isDescription, isInstalments } from "./validator.js";

export function formatAmount(amount?: string) {
  if (!amount) {
    return;
  }

  return parseInt(amount.replace(/[^\d-]/g, "")) / 100;
}

export function formatDescription(description?: string) {
  return description;
}

export function formatInstalments(instalments?: string) {
  if (!instalments) {
    return;
  }

  return instalments.replace("parcela ", "").replace(" de ", "/");
}

export function formatDate(date?: string) {
  if (!date) {
    return;
  }

  const sanitized = date
    .split(/(,|\s)/g)
    .filter((item) => item.trim().replace(/[\W_]+/g, ""))
    .map((item) => item.toLowerCase());

  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  return new Date(
    parseInt(sanitized[2], 10),
    months.findIndex((item) => item === sanitized[1]),
    parseInt(sanitized[0], 10)
  );
}

export function normalizeItem(item: ItemBase) {
  return {
    text: (item.text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x00-\x7F]/g, "")
      .trim(),
  };
}

export function convertInputDataToJson(data?: string) {
  return JSON.parse(data || "").flatMap((item: any) => item.data);
}

export function round(num: number, precision: number = 2) {
  const base = Math.pow(10, precision);
  return Math.round(num * base) / base;
}

export function getTextType(text?: string) {
  if (isAmount(text)) {
    return "amount";
  }

  if (isDate(text)) {
    return "date";
  }

  if (isInstalments(text)) {
    return "instalments";
  }

  if (isDescription(text)) {
    return "description";
  }
}
