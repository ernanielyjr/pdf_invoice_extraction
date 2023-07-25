import {
  formatAmount,
  formatDate,
  formatDescription,
  formatInstalments,
  normalizeItem,
} from "./formatters.js";
import { isHeader, itemIsNotTrash } from "./validator.js";

export function groupEveryTwoItemsReducer(acc, _item, index, list) {
  if (index % 2 === 0) {
    acc.push(list.slice(index, index + 2).flatMap((item) => item));
  }
  return acc;
}

export function createEmptyItemToMatchEvenLengthReducer(acc, item) {
  if (item.length === 3) {
    acc.push({});
  }

  acc.push(item);

  return acc;
}

export function normalizeAndIgrnoreHeadersReducer(acc, item) {
  const newItem = item.map(normalizeItem).filter(itemIsNotTrash);

  if (isHeader(newItem)) {
    return acc;
  }

  acc.push(newItem);

  return acc;
}

export function getIgnoringItemsBeforeHeader(list) {
  const headerIndex = list.findIndex(isHeader);
  return list.slice(headerIndex);
}

export function mergeAndFormatItem(item) {
  return item.reduce((acc, subItem) => {
    const dateIndex = item.findIndex((subSubItem) =>
      subSubItem.text?.includes(", 20")
    );
    const amountIndex = item.findIndex((subSubItem) =>
      subSubItem.text?.includes("R$")
    );
    const instalmentsIndex = item.findIndex((subSubItem) =>
      subSubItem.text?.includes("parcela ")
    );
    const descriptionIndex = item.findIndex(
      (_, subSubIndex) =>
        ![dateIndex, amountIndex, instalmentsIndex].includes(subSubIndex)
    );

    return {
      date: formatDate(item[dateIndex]?.text),
      amount: formatAmount(item[amountIndex]?.text),
      description: formatDescription(item[descriptionIndex]?.text),
      instalments: formatInstalments(item[instalmentsIndex]?.text),
      // __original: item,
    };
  }, {});
}
