import { exec as execOriginal } from "child_process";
import path from "path";
import { promisify } from "util";
import {
  convertInputDataToJson,
  formatAmount,
  formatDate,
  formatDescription,
  formatInstalments,
  getTextType,
  normalizeItem,
  round,
} from "./utils/formatters";
import { FormattedItem, PreFormattedItem } from "./utils/model";
import { textIsCategory } from "./utils/validator";

const exec = promisify(execOriginal);

const DEGUB = true;

var stdin = process.openStdin();

const args = process.argv.slice(2);

const expectedItemsSum = parseFloat(args[0]);
const invoiceDate = args[1];

(async () => {
  const { stdout: result } = await exec(
    [
      "java",
      "-jar",
      path.join(__dirname, "../bin/tabula.jar"),
      `./data/${invoiceDate}-samsung.pdf`,
      "--pages",
      "all",
      "--format",
      "JSON",
      "--silent",
    ].join(" ")
  );

  const data = convertInputDataToJson(result)
    .flatMap((item: any[]) => item)
    .map(normalizeItem)
    .filter(
      (item: any) =>
        item.text !== "" &&
        !textIsCategory(item.text) &&
        !["DATA", "ESTABELECIMENTO", "VALOR"].includes(item.text)
    )
    .map((item: any) => item.text)
    .flatMap((text: string) => text.split(/[\r\n]+/));

  const lastInvoiceAmountIndex = data.findIndex((text: string) =>
    text.startsWith("Total da fatura anterior")
  );
  const donePaymentsAmountIndex = data.findIndex((text: string) =>
    text.startsWith("Pagamentos realizados")
  );

  const lastInvoiceAmount =
    formatAmount(
      data[lastInvoiceAmountIndex].includes("R$ ")
        ? data[lastInvoiceAmountIndex]
        : data[lastInvoiceAmountIndex + 1]
    ) || 0;
  const donePaymentsAmount =
    formatAmount(
      data[donePaymentsAmountIndex].includes("R$ ")
        ? data[donePaymentsAmountIndex]
        : data[donePaymentsAmountIndex + 1]
    ) || 0;

  const debitCreditDiff = round(lastInvoiceAmount + donePaymentsAmount);

  const startIndex =
    data.findIndex((text: string) => text === "Lancamentos do mes") + 1;
  const endIndex = data.findIndex(
    (text: string) => text === "Importante saber"
  );

  const sliced = data.slice(startIndex, endIndex);

  const merged = [];

  for (let i = 0; i < sliced.length; i++) {
    const newItem: PreFormattedItem = {};

    const text0 = sliced[i + 0];
    const text1 = sliced[i + 1];
    const text2 = sliced[i + 2];
    const text3 = sliced[i + 3];

    const type0 = getTextType(text0);
    const type1 = getTextType(text1);
    const type2 = getTextType(text2);
    const type3 = getTextType(text3);

    if (type0 && !newItem.hasOwnProperty(type0)) {
      newItem[type0] = text0;
      i++;
    }

    if (type1 && !newItem.hasOwnProperty(type1)) {
      newItem[type1] = text1;
      i++;
    }

    if (type2 && !newItem.hasOwnProperty(type2)) {
      newItem[type2] = text2;
      i++;
    }

    if (type3 && !newItem.hasOwnProperty(type3)) {
      newItem[type3] = text3;
      i++;
    }

    i--;

    if (newItem.description === "PAGAMENTO") {
      continue;
    }

    merged.push(newItem);
  }

  const final: FormattedItem[] = merged.map((item) => ({
    date: formatDate(item.date),
    amount: formatAmount(item.amount),
    description: formatDescription(item.description),
    instalments: formatInstalments(item.instalments),
  }));

  const itemsSum = round(
    final.reduce((sum, item) => sum + (item.amount || 0), 0)
  );
  const difference = round(itemsSum - expectedItemsSum);

  if (difference && Math.abs(difference) !== Math.abs(debitCreditDiff)) {
    console.error(`Error extracting ${invoiceDate}`, {
      expectedItemsSum,
      itemsSum,
      difference,
      debitCreditDiff,
      lastInvoiceAmount,
      donePaymentsAmount,
    });
  }

  console.log(JSON.stringify(final, null, 2));

  process.exit(0);
})();

export {};
