import {
  convertInputDataToJson,
  formatAmount,
  formatDate,
  formatDescription,
  formatInstalments,
  normalizeItem,
  round,
} from "./utils/formatters.js";
import { textIsCategory } from "./utils/validator.js";

const DEGUB = true;

var stdin = process.openStdin();

const [expectedItemsCount, expectedItemsSum, invoiceDate] = process.argv
  .slice(2)
  .map((item, i) => (i < 2 ? parseFloat(item) : item));

stdin.setEncoding("utf-8");

let result = "";

stdin.on("data", function (data) {
  result += data.trim();
});

function isAmount(text) {
  return (text || "").includes("R$ ");
}

function isDate(text) {
  return (text || "").includes(", 20");
}

function isInstalments(text) {
  return (text || "").includes("parcela ");
}

function isDescription(text) {
  return !isAmount(text) && !isDate(text) && !isInstalments(text);
}

function getTextType(text) {
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

stdin.on("end", function () {
  const data = convertInputDataToJson(result)
    .flatMap((item) => item)
    .map(normalizeItem)
    .filter(
      (item) =>
        item.text !== "" &&
        !textIsCategory(item.text) &&
        !["DATA", "ESTABELECIMENTO", "VALOR"].includes(item.text)
    )
    .map((item) => item.text);

  const startIndex =
    data.findIndex((text) => text === "Lancamentos do mes") + 1;
  const endIndex = data.findIndex((text) => text === "Importante saber");

  const sliced = data.slice(startIndex, endIndex);

  const merged = [];

  for (let i = 0; i < sliced.length; i++) {
    const newItem = {};

    const text0 = sliced[i + 0];
    const text1 = sliced[i + 1];
    const text2 = sliced[i + 2];
    const text3 = sliced[i + 3];

    const type0 = getTextType(text0);
    const type1 = getTextType(text1);
    const type2 = getTextType(text2);
    const type3 = getTextType(text3);

    if (!newItem.hasOwnProperty(type0)) {
      newItem[type0] = text0;
      i++;
    }

    if (!newItem.hasOwnProperty(type1)) {
      newItem[type1] = text1;
      i++;
    }

    if (!newItem.hasOwnProperty(type2)) {
      newItem[type2] = text2;
      i++;
    }

    if (!newItem.hasOwnProperty(type3)) {
      newItem[type3] = text3;
      i++;
    }

    i--;

    if (newItem.description === "PAGAMENTO") {
      continue;
    }

    merged.push(newItem);
  }

  const final = merged.map((item) => ({
    date: formatDate(item.date),
    amount: formatAmount(item.amount),
    description: formatDescription(item.description),
    instalments: formatInstalments(item.instalments),
  }));

  const itemsCount = final.length;
  const itemsSum = round(
    final.reduce((sum, item) => sum + (item.amount || 0), 0)
  );

  if (itemsCount !== expectedItemsCount) {
    console.error(
      `${invoiceDate} - expected ${expectedItemsCount} items, got ${itemsCount}. Difference: ${
        itemsCount - expectedItemsCount
      }`
    );
  }

  if (itemsSum !== expectedItemsSum) {
    console.error(
      `${invoiceDate} - expected ${expectedItemsSum} sum, got ${itemsSum}. Difference: ${
        itemsSum - expectedItemsSum
      }}`
    );
  }
  console.log(JSON.stringify(final, null, 2));

  // console.log(sliced);
  // console.log(JSON.stringify(sliced, null, 2));
});

export {};
