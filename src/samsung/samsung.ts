#!/usr/bin/env node

import fs from "fs";
import { round } from "../helpers";
import {
  argsParser,
  getFilename,
  getHeaderInfo,
  getTabulaResult,
  getTextsFromInvoice,
  makeTheOutput,
  rawDataToFormatted,
} from "./samsung.helpers";

const isStream = !process.stdin.isTTY;

(async () => {
  try {
    const flags = argsParser();
    const invoiceFilename = await getFilename(flags.input, isStream);
    const result = await getTabulaResult(invoiceFilename);

    if (isStream) {
      fs.unlinkSync(invoiceFilename);
    }

    const rawData = getTextsFromInvoice(result);

    const {
      invoiceDate,
      invoiceAmount,
      lastInvoiceAmount,
      donePaymentsAmount,
      startIndex,
      endIndex,
    } = getHeaderInfo(rawData);

    const { formattedStatements, itemsSum, reversedItemsSum } =
      rawDataToFormatted(rawData, startIndex, endIndex);

    const difference = round(itemsSum - invoiceAmount - reversedItemsSum);
    const debitCreditDiff = round(lastInvoiceAmount + donePaymentsAmount);

    if (difference && Math.abs(difference) !== Math.abs(debitCreditDiff)) {
      console.error(`Error extracting`, {
        invoiceDate,
        invoiceAmount,
        itemsSum,
        reversedItemsSum,
        difference,
        debitCreditDiff,
        lastInvoiceAmount,
        donePaymentsAmount,
      });
    }

    makeTheOutput(
      {
        invoiceDate,
        invoiceAmount,
        lastInvoiceAmount,
        donePaymentsAmount,
        statements: formattedStatements,
      },
      isStream,
      flags.output
    );
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
})();

export {};
