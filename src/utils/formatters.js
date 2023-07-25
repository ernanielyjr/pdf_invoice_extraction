export function formatAmount(amount) {
  if (!amount) {
    return;
  }

  return parseInt(amount.replace(/[^\d.-]/g, "")) / 100;
}

export function formatDescription(description) {
  return description;
}

export function formatInstalments(instalments) {
  if (!instalments) {
    return;
  }

  return instalments.replace("parcela ", "").replace(" de ", "/");
}

export function formatDate(date) {
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
    sanitized[2],
    months.findIndex((item) => item === sanitized[1]),
    sanitized[0]
  );
}

export function normalizeItem(item) {
  return {
    text: (item.text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x00-\x7F]/g, "")
      .trim(),
  };
}

export function convertInputDataToJson(data) {
  return JSON.parse(data, null, 2).flatMap((item) => item.data);
}

export function round(num, precision = 2) {
  const base = Math.pow(10, precision);
  return Math.round(num * base) / base;
}
