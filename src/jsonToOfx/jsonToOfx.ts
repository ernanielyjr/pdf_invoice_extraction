#!/usr/bin/env node

import {
  argsParser,
  getContent,
  getOfxInvoice,
  makeTheOutput,
} from "./jsonToOfx.helpers";

const isStream = !process.stdin.isTTY;

(async () => {
  try {
    const flags = argsParser();

    const statements = await getContent(flags.input, isStream);
    const ofxInvoice = getOfxInvoice(statements);

    makeTheOutput(ofxInvoice, isStream, flags.output);
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
})();

export {};
