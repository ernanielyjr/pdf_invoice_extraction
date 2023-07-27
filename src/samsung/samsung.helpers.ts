import args from "args";
import { exec as execOriginal } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 } from "uuid";
import {
  FormattedItem,
  InvoiceOutput,
  ItemBase,
  PreFormattedItem,
  SumStatements,
} from "./samsung.model";

export function textIsCategory(text?: string) {
  return [
    "alimentacao",
    "compras",
    "educacao",
    "lazer",
    "mercado",
    "moradia",
    "outros",
    "saude",
    "servicos",
    "transporte",
    "viagem",
  ].includes((text || "").toLowerCase());
}

export function isAmount(text?: string) {
  return (text || "").includes("R$ ");
}

export function isDate(text?: string) {
  return (text || "").includes(", 20");
}

export function isInstalments(text?: string) {
  return (text || "").includes("parcela ");
}

export function isDescription(text?: string) {
  return !isAmount(text) && !isDate(text) && !isInstalments(text);
}

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

function saveTemporaryFile(): Promise<string> {
  const filename = `.${v4()}.pdf`;

  return new Promise((resolve, reject) => {
    process.stdin.setEncoding("binary");

    let content: any;
    process.stdin.on("data", (chunk) => {
      content += chunk;
    });

    process.stdin.on("end", () => {
      fs.writeFileSync(filename, content, "binary");
      resolve(filename);
    });

    process.stdin.on("error", (error) => {
      reject(error);
    });
  });
}

export function argsParser() {
  args
    .option(["i", "input"], "Input PDF file to convert")
    .option(["o", "output"], "Output JSON file to write")
    .option(["c", "stream"], "Read from stdin")
    .examples([
      {
        description: "Using args",
        usage: `node ${__filename} -i invoice.pdf -o invoice.json`,
      },
      {
        description: "Using stream",
        usage: `cat invoice.pdf | node ${__filename} > invoice.json`,
      },
      {
        description: "Using both modes",
        usage: `cat invoice.pdf | node ${__filename} -o invoice.json`,
      },
    ]);

  return args.parse(process.argv);
}

export async function getFilename(flagsInput: string, isStream: boolean) {
  let invoiceFilename: string = flagsInput;
  if (isStream) {
    invoiceFilename = await saveTemporaryFile();
  }

  if (!fs.existsSync(invoiceFilename)) {
    throw new Error(`File not found: ${invoiceFilename}`);
  }

  return invoiceFilename;
}

export async function getTabulaResult(pdfFilename: string) {
  const jarFilename = path.join(__dirname, "../../bin/tabula.jar");
  if (!fs.existsSync(jarFilename)) {
    throw new Error(`File not found: ${jarFilename}`);
  }

  const exec = promisify(execOriginal);
  const { stdout: result } = await exec(
    [
      "java",
      "-jar",
      jarFilename,
      pdfFilename,
      "--pages",
      "all",
      "--format",
      "JSON",
      "--silent",
    ].join(" ")
  );

  return result;
}

export function getTextsFromInvoice(data: string): string[] {
  return convertInputDataToJson(data)
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
}

function getHeaderIndexes(data: string[]) {
  const invoiceAmountIndex =
    data.findIndex((text) => text.startsWith("Pagamento minimo")) - 1;
  const invoiceDateIndex = invoiceAmountIndex - 1;

  const lastInvoiceAmountIndex = data.findIndex((text) =>
    text.startsWith("Total da fatura anterior")
  );
  const donePaymentsAmountIndex = data.findIndex((text) =>
    text.startsWith("Pagamentos realizados")
  );

  const startIndex =
    data.findIndex((text: string) => text === "Lancamentos do mes") + 1;
  const endIndex = data.findIndex(
    (text: string) => text === "Importante saber"
  );

  return {
    invoiceAmountIndex,
    invoiceDateIndex,
    lastInvoiceAmountIndex,
    donePaymentsAmountIndex,
    startIndex,
    endIndex,
  };
}

export function getHeaderInfo(data: string[]) {
  const {
    invoiceAmountIndex,
    invoiceDateIndex,
    lastInvoiceAmountIndex,
    donePaymentsAmountIndex,
    startIndex,
    endIndex,
  } = getHeaderIndexes(data);

  const invoiceDate = data[invoiceDateIndex].split(" ").join("/");

  const invoiceAmount =
    formatAmount(
      data[invoiceAmountIndex].includes("R$ ")
        ? data[invoiceAmountIndex]
        : data[invoiceAmountIndex + 1]
    ) || 0;

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

  return {
    invoiceDate,
    invoiceAmount,
    lastInvoiceAmount,
    donePaymentsAmount,
    startIndex,
    endIndex,
  };
}

function formatStatements(data: PreFormattedItem[]): FormattedItem[] {
  return data.map((item) => ({
    date: formatDate(item.date) || new Date(),
    amount: formatAmount(item.amount) || 0,
    description: formatDescription(item.description) || "",
    instalments: formatInstalments(item.instalments),
  }));
}

function preFormatStatements(rawStatements: string[]): PreFormattedItem[] {
  const merged: PreFormattedItem[] = [];

  for (let i = 0; i < rawStatements.length; i++) {
    const newItem: PreFormattedItem = {};

    const text0 = rawStatements[i + 0];
    const text1 = rawStatements[i + 1];
    const text2 = rawStatements[i + 2];
    const text3 = rawStatements[i + 3];

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

  return merged;
}

function sumStatements(statements: FormattedItem[]): SumStatements {
  return statements.reduce(
    (accSum, item) => {
      if (item.amount < 0) {
        accSum.reversedItemsSum += item.amount;
      }

      accSum.itemsSum += item.amount;

      return accSum;
    },
    {
      itemsSum: 0,
      reversedItemsSum: 0,
    }
  );
}

export function rawDataToFormatted(
  rawData: string[],
  startIndex: number,
  endIndex: number
) {
  const rawStatements = rawData.slice(startIndex, endIndex);
  const preFormattedStatements = preFormatStatements(rawStatements);
  const formattedStatements = formatStatements(preFormattedStatements);
  const { itemsSum, reversedItemsSum } = sumStatements(formattedStatements);
  return { formattedStatements, itemsSum, reversedItemsSum };
}

export function makeTheOutput(
  final: InvoiceOutput,
  isStream: boolean,
  outputFilename?: string
) {
  const formattedFinal = JSON.stringify(final);

  if (!isStream && outputFilename) {
    fs.writeFileSync(outputFilename, formattedFinal);
    return;
  }

  console.log(formattedFinal);
}
