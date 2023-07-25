import { convertInputDataToJson, round } from "./utils/formatters.js";
import {
  createEmptyItemToMatchEvenLengthReducer,
  getIgnoringItemsBeforeHeader,
  groupEveryTwoItemsReducer,
  mergeAndFormatItem,
  normalizeAndIgrnoreHeadersReducer,
} from "./utils/reducers.js";
import { itemIsValid } from "./utils/validator.js";

const DEGUB = false;

var stdin = process.openStdin();

const [expectedItemsCount, expectedItemsSum] = process.argv
  .slice(2)
  .map((item) => parseFloat(item));

stdin.setEncoding("utf-8");

let result = "";

stdin.on("data", function (data) {
  result += data.trim();
});

stdin.on("end", function () {
  const data = convertInputDataToJson(result);

  const groupedData = getIgnoringItemsBeforeHeader(data)
    .reduce(normalizeAndIgrnoreHeadersReducer, [])
    .reduce(createEmptyItemToMatchEvenLengthReducer, [])
    .reduce(groupEveryTwoItemsReducer, [])
    .map(mergeAndFormatItem)
    .filter(itemIsValid);

  DEGUB && console.log("groupedData", groupedData);

  const itemsCount = groupedData.length;
  const itemsSum = round(
    groupedData.reduce((sum, item) => sum + item.amount, 0)
  );

  if (itemsCount !== expectedItemsCount) {
    DEGUB &&
      console.error(`expected ${expectedItemsCount} items, got ${itemsCount}`);
  }

  if (itemsSum !== expectedItemsSum) {
    DEGUB && console.error(`expected ${expectedItemsSum} sum, got ${itemsSum}`);
  }
  !DEGUB && console.log(JSON.stringify(groupedData, null, 2));
});

export {};
